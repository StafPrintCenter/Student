import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_student/notifications/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_student/notifications/"!</div>
}
