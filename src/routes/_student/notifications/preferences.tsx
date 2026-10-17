import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_student/notifications/preferences')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_student/notifications/preferences"!</div>
}
