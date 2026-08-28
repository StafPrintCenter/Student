import { createFileRoute } from "@tanstack/react-router";
import { PortalLayout } from "@/components/portal/layout";

export const Route = createFileRoute("/_portal")({
  component: PortalLayout,
});
