"use client";

import { Button } from "@/components/ui/button";
import { ClapperboardIcon, UserCircleIcon, UserIcon } from "lucide-react";
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs"

export const AuthButton = () => {
  return (
    <>
      <SignedIn>
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Link
              label="My profile"
              href="/users/current"
              labelIcon={<UserIcon className="size-4" />}
            />
            <UserButton.Link
              label="Studio"
              href="/studio"
              labelIcon={<ClapperboardIcon className="size-4" />}
            />
            <UserButton.Action
              label="manageAccount"
            />
          </UserButton.MenuItems>
        </UserButton>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button
            variant="outline"
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border-blue-500 rounded-full shadow-none"
            >
            <UserCircleIcon />
            Sign in
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  );
};

// "use client";

// import { Button } from "@/components/ui/button";
// import { ClapperboardIcon, UserCircleIcon } from "lucide-react";
// import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
// import { useState, useEffect } from "react";

// export const AuthButton = () => {
//   const { isLoaded, isSignedIn, } = useUser();
//   const [mounted, setMounted] = useState(false);

//   // Wait for hydration
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // Show loading state during initial render
//   if (!mounted || !isLoaded) {
//     return (
//       <div className="flex items-center gap-2">
//         <div className="w-20 h-9 bg-gray-200 rounded-full animate-pulse" />
//         <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
//       </div>
//     );
//   }

//   if (isSignedIn) {
//     return (
//       <UserButton>
//         <UserButton.MenuItems>
//           <UserButton.Link
//             label="Studio"
//             href="/studio"
//             labelIcon={<ClapperboardIcon className="size-4" />}
//           />
//           <UserButton.Action label="manageAccount" />
//         </UserButton.MenuItems>
//       </UserButton>
//     );
//   }

//   return (
//     <SignInButton mode="modal">
//       <Button
//         variant="outline"
//         className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border-blue-500 rounded-full shadow-none"
//       >
//         <UserCircleIcon />
//         Sign in
//       </Button>
//     </SignInButton>
//   );
// };