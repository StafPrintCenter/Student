import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Bell, Calendar, CreditCard, FileText, GraduationCap, LayoutDashboard, LifeBuoy, LineChart, LogOut, Menu, Moon, Search, Sun, User, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { notificationApi, searchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SITE } from "@/data/site";
import logo from "@/assets/logos.json";

function useIsAuthed() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && !user) navigate({ to: "/login" });
  }, [ready, user, navigate]);
  return { user, ready };
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("staf.theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("staf.theme", next ? "dark" : "light");
  };
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Thème">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function BrandMark({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-3">
      <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden">
        <img src={logo.mc} alt="Logo SPC" className="h-7 w-auto object-contain" />
      </span>
      {!collapsed && (
        <div className="leading-tight">
          <div className="font-display text-base">{SITE.name}</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            A REMPLACER
          </div>
        </div>
      )}
    </Link>
  );
}

function SidebarNav({
  onNavigate,
  collapsed,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
}

function GlobalSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ["global-search", q],
    queryFn: () => searchApi.all(q),
    enabled: q.length >= 2,
  });
  const results = data;
  const close = () => {
    setOpen(false);
    setQ("");
  };
  return (
    <Popover
      open={open && q.length >= 2}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQ("");
      }}
    >
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(e.target.value.length >= 2);
            }}
            onFocus={() => q.length >= 2 && setOpen(true)}
            placeholder="Rechercher formations, leçons, factures…"
            className="pl-9 bg-muted/40 border-transparent focus-visible:bg-background"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-110 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={() => close()}
        onEscapeKeyDown={() => close()}
      >
        <ScrollArea className="max-h-80">
          <div className="p-2 space-y-3">
            {results && (
              <>
                <SearchGroup onNavigate={close} label="Formations" items={results.trainings.map((t) => ({ id: t.uuid, label: t.title, to: `/trainings/${t.uuid}` }))} />
                <SearchGroup onNavigate={close} label="Leçons" items={results.lessons.slice(0, 6).map((l) => ({ id: l.uuid, label: l.title, to: `/trainings/${l.training.uuid}` }))} />
                <SearchGroup onNavigate={close} label="Documents" items={results.documents.map((d) => ({ id: d.uuid, label: d.name, to: `/documents` }))} />
                <SearchGroup onNavigate={close} label="Paiements" items={results.payments.map((p) => ({ id: p.uuid, label: p.reference, to: `/payments` }))} />
                <SearchGroup onNavigate={close} label="Certificats" items={results.certificates.map((c) => ({ id: c.uuid, label: c.training_title || c.number, to: `/certificates` }))} />
                {Object.values(results).every((arr) => arr.length === 0) && (
                  <p className="p-4 text-sm text-muted-foreground">Aucun résultat.</p>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function SearchGroup({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: { id: string; label: string; to: string }[];
  onNavigate?: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-col">
        {items.map((it) => (
          <Link
            key={it.id}
            to={it.to as any}
            onClick={onNavigate}
            className="rounded-md px-2 py-1.5 text-sm hover:bg-muted"
          >
            {it.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function NotificationsPopover() {
  const { data } = useQuery({ queryKey: ["notifications"], queryFn: notificationApi.list });
  const unread = useMemo(() => data?.filter((n) => !n.read).length ?? 0, [data]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <p className="text-sm font-semibold">Notifications</p>
          <Link to="/notifications" className="text-xs text-primary hover:underline">
            Voir tout
          </Link>
        </div>
        <ScrollArea className="max-h-80">
          <div className="divide-y">
            {(data ?? []).slice(0, 6).map((n) => (
              <div key={n.uuid} className="p-3 hover:bg-muted/50">
                <div className="flex items-start gap-2">
                  {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user
    ? `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase()
    : "?";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-muted transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-sm font-medium">
            {user?.first_name}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1">
        <div className="p-2">
          <p className="text-sm font-medium">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <div className="h-px bg-border my-1" />
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="w-full text-left rounded-md px-2 py-1.5 text-sm hover:bg-muted flex items-center gap-2"
        >
          <User className="h-4 w-4" /> Profil
        </button>
        <button
          onClick={() => {
            logout();
            navigate({ to: "/login" });
          }}
          className="w-full text-left rounded-md px-2 py-1.5 text-sm hover:bg-muted flex items-center gap-2 text-destructive"
        >
          <LogOut className="h-4 w-4" /> Déconnexion
        </button>
      </PopoverContent>
    </Popover>
  );
}

function SidebarFooter({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user ? `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase() : "?";
  const goProfile = () => { onNavigate?.(); navigate({ to: "/profile" }); };
  const doLogout = () => { onNavigate?.(); logout(); navigate({ to: "/login" }); };
  return (
    <div className={cn("mt-auto border-t border-sidebar-border p-2 space-y-1", collapsed && "px-1")}>
      <button
        onClick={goProfile}
        title={collapsed ? "Profil" : undefined}
        className={cn(
          "w-full flex items-center gap-2 rounded-lg py-2 text-sm hover:bg-muted",
          collapsed ? "justify-center px-2" : "px-2",
        )}
      >
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="min-w-0 text-left">
            <p className="text-sm font-medium truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
          </div>
        )}
      </button>
      <button
        onClick={doLogout}
        title={collapsed ? "Déconnexion" : undefined}
        className={cn(
          "w-full flex items-center gap-2 rounded-lg py-2 text-sm text-destructive hover:bg-destructive/10",
          collapsed ? "justify-center px-2" : "px-3",
        )}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!collapsed && <span>Déconnexion</span>}
      </button>
    </div>
  );
}

export function PortalLayout() {
  const { user, ready } = useIsAuthed();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("staf.sidebar") === "collapsed";
  });
  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("staf.sidebar", next ? "collapsed" : "expanded");
  };

  if (!ready || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grain-bg">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex fixed inset-y-0 left-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <BrandMark collapsed={collapsed} />
        <div className="mt-2 flex-1 overflow-y-auto">
          <SidebarNav collapsed={collapsed} />
        </div>
        <SidebarFooter collapsed={collapsed} />
      </aside>

      <div className={cn("transition-[padding] duration-200", collapsed ? "md:pl-16" : "md:pl-64")}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 backdrop-blur px-4 md:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 flex flex-col">
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation</SheetTitle>
              </SheetHeader>
              <BrandMark />
              <div className="mt-2 flex-1"><SidebarNav onNavigate={() => setMobileOpen(false)} /></div>
              <SidebarFooter onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden md:inline-flex"
            aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
            title={collapsed ? "Déplier le menu" : "Replier le menu"}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1 max-w-md">
            <GlobalSearch />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <NotificationsPopover />
            <UserMenu />
          </div>
        </header>

        <main className="px-4 md:px-8 py-6 md:py-10 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
