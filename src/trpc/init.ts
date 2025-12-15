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

  console.log('Auth User ID:', userId);
  console.log('Has opts:', !!opts);
  console.log('Has req:', !!opts?.req);

  // opts.req is only available in API route contexts, not during SSR prefetch
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

  // Auto-create user if they don't exist
  if (!user) {
    console.log('⚠️ User not found in DB, creating from Clerk...');

    try {
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(ctx.clerkUserId);

      // Build name from firstName and lastName, with fallback
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unknown User';

      // imageUrl is required in your schema, so provide a fallback
      const imageUrl = clerkUser.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;

      [user] = await db
        .insert(users)
        .values({
          clerkId: ctx.clerkUserId,
          name: name,
          imageUrl: imageUrl,
        })
        .returning();

      console.log('✅ User created in DB:', user.id);
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