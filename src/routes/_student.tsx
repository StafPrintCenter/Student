import { useEffect, useRef } from "react";
import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { LogoLoader } from "@/components/site/Logo/Loader";
import { StudentShell } from "@/components/site/StudentShell";
import { useStudentAuth } from "@/hooks/useStudentAuth";

export const Route = createFileRoute("/_student")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: StudentLayout,
});

function StudentLayout() {
  const { ready, isAuthenticated } = useStudentAuth();
  const navigate = useNavigate();
  const currentHref = useLocation({ select: (location) => location.href });
  const requestedHref = useRef(currentHref);
  const redirectStarted = useRef(false);
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (!ready) return;

    if (isAuthenticated) {
      wasAuthenticated.current = true;
      return;
    }

    if (!redirectStarted.current) {
      redirectStarted.current = true;
      navigate({
        to: "/login",
        search: {
          redirectTo: wasAuthenticated.current ? undefined : requestedHref.current,
        },
      });
    }
  }, [ready, isAuthenticated, navigate]);

  if (!ready || !isAuthenticated) {
    return (
      <LogoLoader
        fullScreen
        size={140}
        text="Vérification de votre session…"
      />
    );
  }

  return (
    <StudentShell>
      <Outlet />
    </StudentShell>
  );
}
