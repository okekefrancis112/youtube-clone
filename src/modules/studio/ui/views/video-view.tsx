import { FormSection } from "../sections/form-section";

interface PageProps {
    videoId: string;
};

export const VideoView = async ({ videoId }: PageProps) => {
    return (
        <div className="px-4 pt-2.5 max-w-screen-lg">
            <FormSection videoId={videoId} />
        </div>
    );
}