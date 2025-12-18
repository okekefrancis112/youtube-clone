import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { MainSection } from "./main-items";
import { Separator } from "@/components/ui/separator";
import { PersonalSection } from "./personal-items";
import { SignedIn } from "@clerk/nextjs";
import { SubscriptionsSection } from "./subscriptions-items";

export const HomeSidebar = () => {
  return (
    <Sidebar className="pt-16 z-40 border-none" collapsible="icon">
        <SidebarContent className="bg-background">
            <MainSection />
            <Separator />
            <PersonalSection />
            <SignedIn>
              <>
                <Separator />
                <SubscriptionsSection />
              </>
            </SignedIn>
        </SidebarContent>
    </Sidebar>
  );
};