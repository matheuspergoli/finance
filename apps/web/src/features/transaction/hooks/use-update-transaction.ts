import { useOptimisticReports } from "@/features/report/hooks/use-optimistic-reports"
import { trpc } from "@/libs/trpc"
import { moneyMapper } from "@repo/mappers/money"
import type { TransactionOutput } from "@repo/transaction/schema"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useUpdateTransaction = () => {
	const queryClient = useQueryClient()
	const { updateAllReports } = useOptimisticReports()

	return useMutation(
		trpc.transactionRouter.update.mutationOptions({
			onMutate: async (updatedTransaction) => {
				await queryClient.cancelQueries({
					queryKey: trpc.transactionRouter.list.queryKey()
				})

				const previousTransactions = queryClient.getQueryData(
					trpc.transactionRouter.list.queryKey()
				)

				const optimisticTransaction: TransactionOutput = {
					id: updatedTransaction.id,
					date: updatedTransaction.date,
					type: updatedTransaction.type,
					note: updatedTransaction.note,
					status: updatedTransaction.status,
					description: updatedTransaction.description,
					paymentMethod: updatedTransaction.paymentMethod,
					amount: moneyMapper.toCents(updatedTransaction.amount)
				}

				queryClient.setQueryData(trpc.transactionRouter.list.queryKey(), (old) =>
					(old || []).map((tx) =>
						tx.id === updatedTransaction.id ? optimisticTransaction : tx
					)
				)

				updateAllReports()

				return { previousTransactions }
			},
			onError: (_err, _newTransaction, context) => {
				queryClient.setQueryData(
					trpc.transactionRouter.list.queryKey(),
					context?.previousTransactions
				)
			},
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.transactionRouter.list.queryKey()
				})
			}
		})
	)
}
