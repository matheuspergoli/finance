import type { QueryClient } from "@tanstack/react-query"
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	stripSearchParams
} from "@tanstack/react-router"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { queryClient, trpc } from "@/libs/trpc"
import { ThemeProvider } from "@/shared/components/theming"
import { QueryClientProvider } from "@tanstack/react-query"
import { z } from "zod"
import { auth } from "@/libs/auth"

const defaultValues = {
	code: "",
	state: ""
}

const searchSchema = z.object({
	code: z.string().default(defaultValues.code),
	state: z.string().default(defaultValues.state)
})

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient
}>()({
	component: Root,
	validateSearch: searchSchema,
	beforeLoad: async ({ search, context }) => {
		if (search.code && search.state) {
			await auth.callback({ code: search.code, state: search.state })
			return
		}

		const token = await auth.initializeAuth()

		if (token) {
			await context.queryClient.prefetchQuery(trpc.userRouter.user.queryOptions())
		}
	},
	search: {
		middlewares: [stripSearchParams(defaultValues)]
	},
	head: () => ({
		meta: [{ title: "Minhas Finanças" }]
	})
})

function Root() {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme="default" defaultColorMode="dark">
				<HeadContent />
				<Outlet />
				<TanStackRouterDevtools position="bottom-left" />
				<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
			</ThemeProvider>
		</QueryClientProvider>
	)
}
