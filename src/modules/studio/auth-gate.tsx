// "use client";

// import { useAuth } from "@clerk/nextjs";

// export function AuthGate({ children }: { children: React.ReactNode }) {
//   const { isLoaded, userId } = useAuth();

//   if (!isLoaded) {
//     return null; // or skeleton
//   }

//   if (!userId) {
//     throw new Error("Not authenticated");
//   }

//   return <>{children}</>;
// }
