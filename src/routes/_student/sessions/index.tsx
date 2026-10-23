import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_student/sessions/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_student/sessions/"!</div>
}
