// import { db } from '@/db';
// import { users } from '@/db/schema'
// import { eq } from 'drizzle-orm';
// // import { auth } from '@clerk/nextjs/server';
// import { initTRPC, TRPCError } from '@trpc/server';
// import { cache } from 'react';
// import superjson from 'superjson';
// import { ratelimit } from '@/lib/ratelimit';
// import { currentUser, auth } from '@clerk/nextjs/server';
// import { useAuth } from '@clerk/nextjs';


// export const createTRPCContext = cache(async () => {
//   const { userId } = await auth();
//   console.log('Auth User ID:', userId);
//   // const user = await currentUser();
//   // const user = await useAuth();

//   // console.log('Current User:', user);
//   // console.log('Current User ID:', user?.id);

//   // return { clerkUserId: user?.id };
//   // return { clerkUserId: userId};
//    return {
//     clerkUserId: userId,
//     headers: opts.req.headers,
//   };
// });

// export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// // Avoid exporting the entire t-object
// // since it's not very descriptive.
// // For instance, the use of a t variable
// // is common in i18n libraries.
// const t = initTRPC.context<Context>().create({
//   /**
//    * @see https://trpc.io/docs/server/data-transformers
//    */
//   transformer: superjson,
// });
// // Base router and procedure helpers
// export const createTRPCRouter = t.router;
// export const createCallerFactory = t.createCallerFactory;
// export const baseProcedure = t.procedure;
// export const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
//   const { ctx } = opts;

//   if(!ctx.clerkUserId) {
//     throw new TRPCError({ code: 'UNAUTHORIZED' });
//   }

//   const [user] = await db.select().from(users).where(eq(users.clerkId, ctx.clerkUserId)).limit(1);

//   if (!user) {
//     throw new TRPCError({ code: 'UNAUTHORIZED' });
//   }

//   const { success } = await ratelimit.limit(user.id);

//   if (!success) {
//     throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
//   }

//   return opts.next({
//     ctx: {
//       ...ctx,
//       user,
//     },
//   });
// });

import { db } from '@/db';
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ratelimit } from '@/lib/ratelimit';
import { auth, clerkClient } from '@clerk/nextjs/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  const { userId } = await auth();

  console.log('Auth User ID:', userId);

  return {
    clerkUserId: userId,
    headers: opts.req.headers,
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
