import { db } from "@/db";
import { z } from "zod";
import { videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, desc, eq, lt, or } from "drizzle-orm";

export const studioRouter = createTRPCRouter({
    getMany: protectedProcedure
    .input(
        z.object({
            cursor: z.object({
                id: z.string().uuid(),
                updateAt: z.date(),
            })
            .nullish(),
            limit: z.number().min(1).max(100),
        }),
    )
    .query(async ({ ctx, input }) => {
        const { cursor, limit } = input;
        const { id: userId } = ctx.user;
        const data = await db
            .select()
            .from(videos)
            .where( and (
                eq(videos.userId, userId),
                cursor
                    ? or(
                        lt(videos.updateAt, cursor.updateAt),
                        and(
                            eq(videos.updateAt, cursor.updateAt),
                            lt(videos.id, cursor.id),
                        )
                    )
                : undefined,
            )).orderBy(desc(videos.updateAt), desc(videos.id))
            // Add 1 to the limit to check if there is more data
            .limit(limit + 1)

            const hasMore = data.length > limit
            // Remove the extra item if there is more data
            const items = hasMore ? data.slice(0, -1) : data;
            // Set the cursor to the last item if there is more data
            const lastItem = items[items.length - 1];
            const nextCursor = hasMore ?
            {
                id: lastItem.id,
                updateAt: lastItem.updateAt,
            }
            : null;

        return {
            items,
            nextCursor,
        };
    }),
});

// import { db } from "@/db";
// import { z } from "zod";
// import { videos } from "@/db/schema";
// import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
// import { and, desc, eq, lt, or } from "drizzle-orm";

// export const studioRouter = createTRPCRouter({
//     getMany: protectedProcedure
//     .input(
//         z.object({
//             cursor: z.object({
//                 id: z.string().uuid(),
//                 updateAt: z.date(),
//             })
//             .nullish(),
//             limit: z.number().min(1).max(100),
//         }),
//     )
//     .query(async ({ ctx, input }) => {
//         const { cursor, limit } = input;
//         const userId = ctx.user.id;
//         console.log("studioRouter userId>>>>>>>>>>>>>>>>>>>>>>>>>: ", userId);

//         const data = await db
//             .select()
//             .from(videos)
//             .where( and (
//                 eq(videos.userId, userId),
//                 cursor
//                     ? or(
//                         lt(videos.updateAt, cursor.updateAt),
//                         and(
//                             eq(videos.updateAt, cursor.updateAt),
//                             lt(videos.id, cursor.id),
//                         )
//                     )
//                 : undefined,
//             )).orderBy(desc(videos.updateAt), desc(videos.id))
//             // Add 1 to the limit to check if there is more data
//             .limit(limit + 1)

//         const hasMore = data.length > limit
//         // Remove the extra item if there is more data
//         const items = hasMore ? data.slice(0, -1) : data;
//         // Set the cursor to the last item if there is more data
//         const lastItem = items[items.length - 1];
//         const nextCursor = hasMore ?
//         {
//             id: lastItem.id,
//             updateAt: lastItem.updateAt,
//         }
//         : null;

//         return {
//             items,
//             nextCursor,
//         };
//     }),
// });

// export const studioRouter = createTRPCRouter({
//     getMany: protectedProcedure
//     .input(
//         z.object({
//             cursor: z.object({
//                 id: z.string().uuid(),
//                 updateAt: z.date(),
//             })
//             .nullish(),
//             limit: z.number().min(1).max(100),
//         }),
//     )
//     .query(async ({ ctx, input }) => {
//         const { cursor, limit } = input;
//         const userId = ctx.user.id;

//         console.log('Studio query debug:', {
//             userId,
//             cursor,
//             limit,
//             hasCursor: !!cursor
//         });

//         const data = await db
//             .select()
//             .from(videos)
//             .where( and (
//                 eq(videos.userId, userId),
//                 cursor
//                     ? or(
//                         lt(videos.updateAt, cursor.updateAt),
//                         and(
//                             eq(videos.updateAt, cursor.updateAt),
//                             lt(videos.id, cursor.id),
//                         )
//                     )
//                 : undefined,
//             ))
//             .orderBy(desc(videos.updateAt), desc(videos.id))
//             .limit(limit + 1);

//         console.log('Raw database results:', {
//             totalResults: data.length,
//             results: data.map(v => ({ id: v.id, title: v.title, userId: v.userId }))
//         });

//         const hasMore = data.length > limit;
//         const items = hasMore ? data.slice(0, -1) : data;
//         const lastItem = items[items.length - 1];
//         const nextCursor = hasMore ? {
//             id: lastItem.id,
//             updateAt: lastItem.updateAt,
//         } : null;

//         console.log('Processed response:', {
//             itemsCount: items.length,
//             hasMore,
//             nextCursor
//         });

//         return {
//             items,
//             nextCursor,
//         };
//     }),
// });