import { useOptimisticReports } from "@/features/report/hooks/use-optimistic-reports"
import { trpc } from "@/libs/trpc"
import { moneyMapper } from "@repo/mappers/money"
import type { TransactionOutput } from "@repo/transaction/schema"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCreateTransaction = () => {
	const queryClient = useQueryClient()
	const { updateAllReports } = useOptimisticReports()

	return useMutation(
		trpc.transactionRouter.create.mutationOptions({
			onMutate: async (newTransaction) => {
				await queryClient.cancelQueries({
					queryKey: trpc.transactionRouter.list.queryKey()
				})

				const previousTransactions = queryClient.getQueryData(
					trpc.transactionRouter.list.queryKey()
				)

				const optimisticTransaction: TransactionOutput = {
					id: newTransaction.id,
					type: newTransaction.type,
					date: newTransaction.date,
					note: newTransaction.note,
					status: newTransaction.status,
					description: newTransaction.description,
					paymentMethod: newTransaction.paymentMethod,
					amount: moneyMapper.toCents(newTransaction.amount)
				}

				queryClient.setQueryData(trpc.transactionRouter.list.queryKey(), (old) => {
					return [optimisticTransaction, ...(old || [])]
				})

				updateAllReports()

				return { previousTransactions }
			},
			onError: (_err, _newCategory, context) => {
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
