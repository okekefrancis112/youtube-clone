import { categoriesRouter } from '@/modules/categories/server/procedures';
import { studioRouter } from '@/modules/studio/server/procedures';
import { videosRouter } from '@/modules/videos/server/procedures';
import { videoViewsRouter } from '@/modules/video-views/procedures';
import { videoReactionsRouter } from '@/modules/video-reactions/procedures';
import { subscriptionsRouter } from '@/modules/subscriptions/server/procedures';
import { commentsRouter } from '@/modules/comments/server/procedures';
import { commentReactionsRouter } from '@/modules/comment-reactions/procedures';
import { suggestionsRouter } from '@/modules/suggestions/server/procedures';

import { createTRPCRouter } from '../init';
import { searchRouter } from '@/modules/search/server/procedures';
import { playlistsRouter } from '@/modules/playlists/server/procedures';
import { usersRouter } from '@/modules/users/server/procedures';

export const appRouter = createTRPCRouter({
  users: usersRouter,
  studio: studioRouter,
  videos: videosRouter,
  search: searchRouter,
  playlists: playlistsRouter,
  comments: commentsRouter,
  categories: categoriesRouter,
  videoViews: videoViewsRouter,
  suggestions: suggestionsRouter,
  subscriptions: subscriptionsRouter,
  videoReactions: videoReactionsRouter,
  commentReactions: commentReactionsRouter,
});

export type AppRouter = typeof appRouter;