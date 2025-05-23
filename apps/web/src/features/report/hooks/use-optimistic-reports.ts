import { trpc } from "@/libs/trpc"
import {
	calculateBalance,
	calculateMonthlyComparison,
	getCurrentYearDateRange,
	groupByMonth
} from "@repo/report"
import type { TransactionOutput } from "@repo/transaction/schema"
import { useQueryClient } from "@tanstack/react-query"
import { endOfDay } from "date-fns"

export const useOptimisticReports = () => {
	const queryClient = useQueryClient()

	const updateAllReports = () => {
		const allTransactions =
			queryClient.getQueryData<TransactionOutput[]>(trpc.transactionRouter.list.queryKey()) ||
			[]

		const todayTimestamp = endOfDay(new Date()).getTime()

		const balanceTransactions = allTransactions
			.filter((tx) => tx.status === "paid" && tx.date.getTime() <= todayTimestamp)
			.map((v) => ({ ...v, date: v.date.getTime() }))

		queryClient.setQueryData(trpc.reportRouter.balance.queryKey(), () => {
			return calculateBalance(balanceTransactions)
		})

		const comparisonTransactions = allTransactions
			.filter((tx) => tx.status === "paid")
			.map((v) => ({ ...v, date: v.date.getTime() }))

		queryClient.setQueryData(trpc.reportRouter.monthlyComparison.queryKey(), () => {
			return calculateMonthlyComparison(comparisonTransactions)
		})

		const yearRange = getCurrentYearDateRange()
		const monthlySummaryKey = trpc.reportRouter.listMonthlySummary.queryKey()
		const fromTimestamp = yearRange.from.getTime()
		const toTimestamp = yearRange.to.getTime()

		const monthlySummaryTransactions = allTransactions
			.filter(
				(tx) =>
					tx.status === "paid" &&
					tx.date.getTime() >= fromTimestamp &&
					tx.date.getTime() <= toTimestamp
			)
			.map((v) => ({ ...v, date: v.date.getTime() }))

		queryClient.setQueryData(monthlySummaryKey, () => {
			return groupByMonth(monthlySummaryTransactions)
		})
	}

	return { updateAllReports }
}
