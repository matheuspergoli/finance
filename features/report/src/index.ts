import { endOfMonth, format, parseISO, startOfMonth, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"

export type TransactionBase = {
	date: number
	amount: number
	type: "income" | "expense"
}

export const calculateBalance = (transactions: TransactionBase[]) => {
	let income = 0
	let expense = 0

	for (const tx of transactions) {
		if (tx.type === "income") {
			income += tx.amount
		} else if (tx.type === "expense") {
			expense += tx.amount
		}
	}

	return income - expense
}

export const groupByMonth = (transactions: TransactionBase[]) => {
	const summary: Record<string, { income: number; expense: number }> = {}

	for (const tx of transactions) {
		const key = format(tx.date, "yyyy-MM")

		if (!summary[key]) {
			summary[key] = { income: 0, expense: 0 }
		}
		summary[key][tx.type] += tx.amount
	}

	return Object.entries(summary)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, values]) => {
			const label = format(parseISO(`${key}-01`), "MMM", { locale: ptBR })
			return {
				month: label,
				income: values.income,
				expense: values.expense
			}
		})
}

export const calculateMonthlyComparison = (transactions: TransactionBase[]) => {
	const now = new Date()

	const currentMonthStart = startOfMonth(now).getTime()
	const currentMonthEnd = endOfMonth(now).getTime()
	const previousMonthStart = startOfMonth(subMonths(now, 1)).getTime()
	const previousMonthEnd = endOfMonth(subMonths(now, 1)).getTime()

	const summary = {
		income: {
			currentTotal: 0,
			previousTotal: 0,
			percentageChange: 0
		},
		expense: {
			currentTotal: 0,
			previousTotal: 0,
			percentageChange: 0
		}
	}

	for (const tx of transactions) {
		const date = tx.date

		if (date >= currentMonthStart && date <= currentMonthEnd) {
			if (tx.type === "income") {
				summary.income.currentTotal += tx.amount
			} else if (tx.type === "expense") {
				summary.expense.currentTotal += tx.amount
			}
		} else if (date >= previousMonthStart && date <= previousMonthEnd) {
			if (tx.type === "income") {
				summary.income.previousTotal += tx.amount
			} else if (tx.type === "expense") {
				summary.expense.previousTotal += tx.amount
			}
		}
	}

	const calcChange = (current: number, previous: number) => {
		return previous > 0 ? ((current - previous) / previous) * 100 : 0
	}

	summary.income.percentageChange = calcChange(
		summary.income.currentTotal,
		summary.income.previousTotal
	)

	summary.expense.percentageChange = calcChange(
		summary.expense.currentTotal,
		summary.expense.previousTotal
	)

	return summary
}

export const getCurrentYearDateRange = () => {
	const now = new Date()
	const startOfYear = new Date(now.getFullYear(), 0, 1)
	const endOfYear = new Date(now.getFullYear(), 11, 31)

	return {
		from: startOfYear,
		to: endOfYear
	}
}
