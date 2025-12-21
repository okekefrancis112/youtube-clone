import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs"
import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

interface InputType {
    userId: string;
    videoId: string;
    prompt: string;
};

export const { POST } = serve(
  async (context) => {
    const utapi = new UTApi();
    const input = context.requestPayload as InputType;
    const { videoId, userId, prompt } = input;

    const video = await context.run("get-video", async () => {
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(
            eq(videos.id, videoId),
            eq(videos.userId, userId),
        ))

        if (!existingVideo) {
            throw new Error("Not found");
        }

        return existingVideo;
    });

    const { body } = await context.call<{ data: { url: string }[] }>(
        "generate-thumbnail",
        {
            url: "https://api.openai.com/v1/images/generations",
            method: "POST",
            body: {
                prompt,
                n: 1,
                model: "dall-e-3",
                size: "1792x1024",
            },
            headers: {
                authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            }
        }
    );

    const tempThumbnailUrl = body.data[0]?.url;

    if (!tempThumbnailUrl) {
        throw new Error("Bad request: Failed to generate thumbnail");
    }

    const uploadedThumbnail = await context.run("upload-thumbnail", async () => {
        const { data } = await utapi.uploadFilesFromUrl(tempThumbnailUrl);

        if (!data) {
            throw new Error("Bad request: Failed to upload thumbnail");
        }

        return data;
    });

    const oldThumbnailKey = video.thumbnailKey;

    await context.run("update-video", async () => {
        await db
            .update(videos)
            .set({
                thumbnailKey: uploadedThumbnail.key,
                thumbnailUrl: uploadedThumbnail.url,
                updatedAt: new Date(),
            })
            .where(and(
                eq(videos.id, video.id),
                eq(videos.userId, video.userId),
            ))
    });

    if (oldThumbnailKey) {
        await context.run("cleanup-thumbnail", async () => {
            try {
                const deleteResult = await utapi.deleteFiles(oldThumbnailKey);

                if (deleteResult.success) {
                    console.log(`Successfully deleted old thumbnail: ${oldThumbnailKey}`);
                } else {
                    console.warn(`Failed to delete old thumbnail: ${oldThumbnailKey}`, deleteResult);
                }

            } catch (error) {
                console.error(`Error cleaning up thumbnail ${oldThumbnailKey}:`, error);
            }
        });
    }
  }
)