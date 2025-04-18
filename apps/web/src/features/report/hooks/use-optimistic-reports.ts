import { trpc } from "@/libs/trpc"
import { useQueryClient } from "@tanstack/react-query"
import {
	calculateBalance,
	groupByMonth,
	calculateMonthlyComparison,
	getCurrentYearDateRange
} from "@repo/report"

export const useOptimisticReports = () => {
	const queryClient = useQueryClient()

	const updateAllReports = () => {
		const transactions = queryClient.getQueryData(trpc.transactionRouter.list.queryKey()) || []

		queryClient.setQueryData(trpc.reportRouter.balance.queryKey(), () => {
			return calculateBalance(transactions.map((v) => ({ ...v, date: v.date.getTime() })))
		})

		queryClient.setQueryData(trpc.reportRouter.monthlyComparison.queryKey(), () => {
			return calculateMonthlyComparison(
				transactions.map((v) => ({ ...v, date: v.date.getTime() }))
			)
		})

		const yearRange = getCurrentYearDateRange()
		const monthlySummaryKey = trpc.reportRouter.listMonthlySummary.queryKey()

		const fromTimestamp = yearRange.from.getTime()
		const toTimestamp = yearRange.to.getTime()
		const yearTransactions = transactions.filter(
			(tx) => tx.date.getTime() >= fromTimestamp && tx.date.getTime() <= toTimestamp
		)

		queryClient.setQueryData(monthlySummaryKey, () => {
			return groupByMonth(yearTransactions.map((v) => ({ ...v, date: v.date.getTime() })))
		})
	}

	return { updateAllReports }
}
