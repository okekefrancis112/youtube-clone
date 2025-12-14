// import { DEFAULT_LIMIT } from "@/constants";
// import { StudioView } from "@/modules/studio/ui/views/studio-view";
// import { HydrateClient, trpc } from "@/trpc/server";

// export const dynamic = "force-dynamic";

// const Page = async () => {
//   void trpc.studio.getMany.prefetchInfinite({
//     limit: DEFAULT_LIMIT,
//   });

//   return (
//     <HydrateClient>
//       <StudioView />
//     </HydrateClient>
//   );
// };

import { DEFAULT_LIMIT } from "@/constants";
import { StudioView } from "@/modules/studio/ui/views/studio-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

const Page = async () => {
  console.log('=== SERVER COMPONENT DIAGNOSTIC ===');

  try {
    // Just attempt the prefetch and see what happens
    console.log('Attempting prefetchInfinite...');
    await trpc.studio.getMany.prefetchInfinite({
      limit: DEFAULT_LIMIT,
    });
    console.log('✅ PrefetchInfinite completed without error');
  } catch (error) {
    console.log('❌ PrefetchInfinite failed:', {
      message: (error as Error).message,
      name: (error as Error).name,
      // Don't log stack in production, but useful for debugging
    });

    // Let's see what trpc actually is
    console.log('trpc type:', typeof trpc);
    console.log('trpc.studio type:', typeof trpc.studio);
    console.log('trpc.studio.getMany type:', typeof trpc.studio.getMany);
  }

  return (
    <HydrateClient>
      <StudioView />
    </HydrateClient>
  );
};

export default Page;