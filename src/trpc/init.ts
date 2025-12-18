import { db } from '@/db';
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ratelimit } from '@/lib/ratelimit';
import { auth, clerkClient } from '@clerk/nextjs/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export const createTRPCContext = async (opts?: FetchCreateContextFnOptions) => {
  const { userId } = await auth();

  const requestHeaders = opts?.req?.headers;

  return {
    clerkUserId: userId,
    headers: requestHeaders,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts;

  if (!ctx.clerkUserId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }

  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, ctx.clerkUserId))
    .limit(1);

  if (!user) {
    try {
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(ctx.clerkUserId);

      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unknown User';

      const imageUrl = clerkUser.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;

      [user] = await db
        .insert(users)
        .values({
          clerkId: ctx.clerkUserId,
          name: name,
          imageUrl: imageUrl,
        })
        .returning();
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user'
      });
    }
  }

  const { success } = await ratelimit.limit(user.id);

  if (!success) {
    throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
  }

  return opts.next({
    ctx: {
      ...ctx,
      user,
    },
  });
});