import { useOptimisticReports } from "@/features/report/hooks/use-optimistic-reports"
import { trpc } from "@/libs/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { TransactionOutput } from "@repo/transaction/schema"

export const useBulkUpdateTransactions = () => {
	const queryClient = useQueryClient()
	const { updateAllReports } = useOptimisticReports()

	return useMutation(
		trpc.transactionRouter.bulkUpdate.mutationOptions({
			onMutate: async (updatedTransactions) => {
				await queryClient.cancelQueries({
					queryKey: trpc.transactionRouter.list.queryKey()
				})

				const previousTransactions = queryClient.getQueryData<TransactionOutput[]>(
					trpc.transactionRouter.list.queryKey()
				)

				if (!previousTransactions) return { previousTransactions: [] }

				const updatedMap = new Map(updatedTransactions.map((tx) => [tx.id, tx]))

				const optimisticTransactions = previousTransactions.map((tx) => {
					const updated = updatedMap.get(tx.id)
					return updated ?? tx
				})

				queryClient.setQueryData(
					trpc.transactionRouter.list.queryKey(),
					optimisticTransactions
				)

				updateAllReports()

				return { previousTransactions }
			},
			onError: (_err, _input, context) => {
				if (context?.previousTransactions) {
					queryClient.setQueryData(
						trpc.transactionRouter.list.queryKey(),
						context.previousTransactions
					)
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
