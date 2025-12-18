// import { useUser } from "@clerk/nextjs";
// import Link from "next/link";
// import { Skeleton } from "@/components/ui/skeleton";
// import { SidebarHeader, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
// import { UserAvatar } from "@/components/user-avartar";

// export const StudioSidebarHeader = () => {
//     const { user } = useUser();
//     const { state } = useSidebar();

//     if (!user) {
//         return (
//             <SidebarHeader className="flex items-center justify-center pb-4">
//                 <Skeleton className="size-[112px] rounded-full"/>
//                 <div className="flex flex-col items-center mt-2 gap-y-2">
//                     <Skeleton className="h-4 w-[80px]"/>
//                     <Skeleton className="h-4 w-[100px]"/>
//                 </div>
//             </SidebarHeader>
//         );
//     }

//     if (state === "collapsed") {
//         return (
//             <SidebarMenuItem>
//                 <SidebarMenuButton tooltip="Your Profile" asChild>
//                     <Link href="/users/current">
//                         <UserAvatar
//                             imageUrl={user?.imageUrl}
//                             name={user?.fullName ?? "User"}
//                             size="xs"
//                         />
//                         <span className="text-sm">Your Profile</span>
//                     </Link>
//                 </SidebarMenuButton>
//             </SidebarMenuItem>
//         )
//     }
//   return (
//     <SidebarHeader className="flex items-center justify-center pb-4">
//         <Link href="/users/current">
//             <UserAvatar
//                 imageUrl={user.imageUrl}
//                 name={user.fullName ?? "User"}
//                 className="size-[112px] hover:opacity-80 transition-opacity"
//             />
//         </Link>
//         <div className="flex flex-col items-center mt-2 gap-y-1">
//             <p className="text-sm font-medium">
//                 Your Profile
//             </p>
//             <p className="text-xs text-muted-foreground">
//                 {user.fullName}
//             </p>
//         </div>
//     </SidebarHeader>
//   );
// };


// /components/StudioSidebarHeader.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarHeader, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/user-avatar";

export const StudioSidebarHeader = () => {
    const { isLoaded, user } = useUser();
    const { state } = useSidebar();
    const [isClient, setIsClient] = useState(false);

    // This ensures we only render client-specific content after hydration
    useEffect(() => {
        setIsClient(true);
    }, []);

    // During SSR and initial client render, show consistent skeleton
    // This prevents hydration mismatch
    if (!isClient || !isLoaded) {
        return (
            <SidebarHeader className="flex items-center justify-center pb-4">
                <Skeleton className="size-[112px] rounded-full"/>
                <div className="flex flex-col items-center mt-2 gap-y-2">
                    <Skeleton className="h-4 w-[80px]"/>
                    <Skeleton className="h-4 w-[100px]"/>
                </div>
            </SidebarHeader>
        );
    }

    // After hydration and Clerk is loaded, check for user
    if (!user) {
        return (
            <SidebarHeader className="flex items-center justify-center pb-4">
                <Link href="/sign-in">
                    <Skeleton className="size-[112px] rounded-full hover:opacity-80 transition-opacity"/>
                </Link>
                <div className="flex flex-col items-center mt-2 gap-y-1">
                    <p className="text-sm font-medium">
                        Sign In
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Access your profile
                    </p>
                </div>
            </SidebarHeader>
        );
    }

    if (state === "collapsed") {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Your Profile" asChild>
                    <Link href="/users/current">
                        <UserAvatar
                            imageUrl={user.imageUrl}
                            name={user.fullName ?? "User"}
                            size="xs"
                        />
                        <span className="text-sm">Your Profile</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    }

    return (
        <SidebarHeader className="flex items-center justify-center pb-4">
            <Link href="/users/current">
                <UserAvatar
                    imageUrl={user.imageUrl}
                    name={user.fullName ?? "User"}
                    className="size-[112px] hover:opacity-80 transition-opacity"
                />
            </Link>
            <div className="flex flex-col items-center mt-2 gap-y-1">
                <p className="text-sm font-medium">
                    Your Profile
                </p>
                <p className="text-xs text-muted-foreground">
                    {user.fullName}
                </p>
            </div>
        </SidebarHeader>
    );
};
