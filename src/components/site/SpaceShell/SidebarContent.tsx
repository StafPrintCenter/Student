import { useStudentAuth } from "@/hooks/useStudentAuth";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { SpaceHeaderBrand, StudentSidebarNav, StudentSidebarFooter } from "./";

export function StudentSidebarContent({
  user,
  pathname,
  onDisconnectClick,
}: {
  user: ReturnType<typeof useStudentAuth>["user"];
  pathname: string;
  onDisconnectClick: () => void;
}) {
  const { setOpenMobile } = useSidebar();
  const handleNavClick = () => setOpenMobile(false);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <SpaceHeaderBrand onNavClick={handleNavClick} />
      <StudentSidebarNav pathname={pathname} onNavClick={handleNavClick} />
      <StudentSidebarFooter
        user={user}
        pathname={pathname}
        onNavClick={handleNavClick}
        onDisconnectClick={onDisconnectClick}
      />
    </Sidebar>
  );
}