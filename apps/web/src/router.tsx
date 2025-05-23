import { createRouter } from "@tanstack/react-router"
import { queryClient } from "./libs/trpc"
import { routeTree } from "./routeTree.gen"
import { DefaultCatchBoundary } from "./shared/components/default-catch-boundary"
import { DefaultNotFound } from "./shared/components/default-not-found"
import { LoadingProgress } from "./shared/components/loading-progress"

export const router = createRouter({
	routeTree,
	scrollRestoration: true,
	defaultPreload: "intent",
	context: { queryClient },
	defaultPreloadStaleTime: 0,
	scrollRestorationBehavior: "smooth",
	defaultPendingComponent: () => <LoadingProgress />,
	defaultNotFoundComponent: () => <DefaultNotFound />,
	defaultErrorComponent: (error) => <DefaultCatchBoundary {...error} />
})
