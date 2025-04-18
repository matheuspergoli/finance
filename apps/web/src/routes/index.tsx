import { auth } from "@/libs/auth"
import { trpc } from "@/libs/trpc"
import { Button } from "@/shared/components/button"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		const user = await context.queryClient.fetchQuery(trpc.userRouter.user.queryOptions())

		if (user?.id) {
			throw redirect({ to: "/dashboard" })
		}
	}
})

function RouteComponent() {
	const { data: user } = useSuspenseQuery(trpc.userRouter.user.queryOptions())

	return (
		<main className="h-dvh w-screen flex flex-col items-center justify-center">
			<p className="font-bold text-lg text-center">{user?.email}</p>

			<div className="w-fit mx-auto space-x-5">
				<Button onClick={async () => await auth.login()}>Login</Button>
				<Button onClick={async () => await auth.logout()}>Logout</Button>
			</div>
		</main>
	)
}
