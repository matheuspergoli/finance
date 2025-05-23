import { env } from "@/environment/env"
import type { AppRouter } from "@repo/types"
import { MutationCache, QueryClient } from "@tanstack/react-query"
import { matchQuery } from "@tanstack/react-query"
import { QueryCache } from "@tanstack/react-query"
import { createTRPCClient, httpBatchLink } from "@trpc/client"
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"
import { toast } from "sonner"
import SuperJSON from "superjson"
import { auth } from "./auth"

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			staleTime: Number.POSITIVE_INFINITY
		}
	},
	queryCache: new QueryCache({
		onError: () => {
			toast.error("Algo deu errado", {
				action: {
					label: "Tentar novamente",
					onClick: () => {
						queryClient.invalidateQueries()
					}
				}
			})
		}
	}),

	mutationCache: new MutationCache({
		onSuccess: (_data, _variables, _context, mutation) => {
			queryClient.invalidateQueries({
				predicate: (query) => {
					return (
						mutation.meta?.invalidates?.some((queryKey) => {
							return matchQuery({ queryKey }, query)
						}) ?? true
					)
				}
			})
		}
	})
})

const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${env.VITE_BACKEND_URL}/trpc`,
			transformer: SuperJSON,
			headers: () => {
				const currentAccessToken = auth.tokenStorage.getAccessToken()

				if (currentAccessToken) {
					return {
						Authorization: `Bearer ${currentAccessToken}`
					}
				}

				return {}
			}
		})
	]
})

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient
})
