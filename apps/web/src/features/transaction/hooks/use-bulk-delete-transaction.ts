import { useOptimisticReports } from "@/features/report/hooks/use-optimistic-reports"
import { trpc } from "@/libs/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useBulkDeleteTransactions = () => {
	const queryClient = useQueryClient()
	const { updateAllReports } = useOptimisticReports()

	return useMutation(
		trpc.transactionRouter.bulkDelete.mutationOptions({
			onMutate: async (deletedIds) => {
				await queryClient.cancelQueries({
					queryKey: trpc.transactionRouter.list.queryKey()
				})

				const previous = queryClient.getQueryData(trpc.transactionRouter.list.queryKey())

				queryClient.setQueryData(trpc.transactionRouter.list.queryKey(), (old) => {
					return old ? old.filter((value) => !deletedIds.includes(value.id)) : []
				})

				updateAllReports()

				return { previous }
			},
			onError: (_err, _deletedIds, context) => {
				if (context) {
					queryClient.setQueryData(trpc.transactionRouter.list.queryKey(), context.previous)
				}
			},
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.transactionRouter.list.queryKey()
				})
			}
		})
	)
}
