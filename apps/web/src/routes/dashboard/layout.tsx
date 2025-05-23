import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { trpc } from "@/libs/trpc"
import { MainSidebar } from "@/shared/components/app-sidebar/main-sidebar"
import { Separator } from "@/shared/components/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/shared/components/sidebar"

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
	beforeLoad: async ({ context: { queryClient } }) => {
		const user = await queryClient.fetchQuery(trpc.userRouter.user.queryOptions())

		if (!user?.id) {
			throw redirect({ to: "/" })
		}
	}
})

function RouteComponent() {
	return (
		<SidebarProvider>
			<MainSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
					</div>
				</header>
				<div className="container my-5 px-4 mx-auto">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
