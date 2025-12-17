import { PlaylistHeaderSection } from "../sections/playlist-header-section";
import { VideosSection } from "../sections/videos-section";

interface VideoViewsProps {
  playlistId: string;
}

export const VideosView = ({ playlistId }: VideoViewsProps) => {
  return (
    <div className="max-w-screen-m mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <PlaylistHeaderSection playlistId={playlistId} />
      <VideosSection playlistId={playlistId} />
    </div>
  );
};