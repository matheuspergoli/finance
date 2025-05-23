import { db } from "@/db/client"
import { transactionsTable } from "@/db/schema"
import { createTRPCRouter, protectedProcedure } from "@/libs/trpc"
import { dateMapper } from "@repo/mappers/date"
import {
	calculateMonthlyComparison,
	getCurrentYearDateRange,
	groupByMonth
} from "@repo/report"
import { endOfDay, endOfMonth, startOfMonth, subMonths } from "date-fns"
import { and, between, eq, isNull, lte, or, sql } from "drizzle-orm"

export const reportRouter = createTRPCRouter({
	balance: protectedProcedure.query(async ({ ctx }) => {
		const todayTimestamp = dateMapper.toTimestamp(endOfDay(new Date()))

		const result = await db
			.select({
				income:
					sql`COALESCE(SUM(CASE WHEN ${transactionsTable.type} = 'income' THEN ${transactionsTable.amount} ELSE 0 END), 0)`.mapWith(
						Number
					),
				expense:
					sql`COALESCE(SUM(CASE WHEN ${transactionsTable.type} = 'expense' THEN ${transactionsTable.amount} ELSE 0 END), 0)`.mapWith(
						Number
					)
			})
			.from(transactionsTable)
			.where(
				and(
					isNull(transactionsTable.deletedAt),
					eq(transactionsTable.userId, ctx.subjects.properties.id),
					eq(transactionsTable.status, "paid"),
					lte(transactionsTable.date, todayTimestamp)
				)
			)
			.get()

		const income = result?.income ?? 0
		const expense = result?.expense ?? 0

		return income - expense
	}),

	listMonthlySummary: protectedProcedure.query(async ({ ctx }) => {
		const dates = getCurrentYearDateRange()
		const toDate = dateMapper.toTimestamp(dates.to)
		const fromDate = dateMapper.toTimestamp(dates.from)

		const rows = await db
			.select({
				date: transactionsTable.date,
				type: transactionsTable.type,
				amount: transactionsTable.amount
			})
			.from(transactionsTable)
			.where(
				and(
					isNull(transactionsTable.deletedAt),
					between(transactionsTable.date, fromDate, toDate),
					eq(transactionsTable.userId, ctx.subjects.properties.id),
					eq(transactionsTable.status, "paid")
				)
			)

		const transactions = rows.map((tx) => ({
			date: tx.date,
			type: tx.type,
			amount: tx.amount
		}))

		return groupByMonth(transactions)
	}),

	monthlyComparison: protectedProcedure.query(async ({ ctx }) => {
		const now = new Date()

		const currentMonthStart = dateMapper.toTimestamp(startOfMonth(now))
		const currentMonthEnd = dateMapper.toTimestamp(endOfMonth(now))
		const previousMonthStart = dateMapper.toTimestamp(startOfMonth(subMonths(now, 1)))
		const previousMonthEnd = dateMapper.toTimestamp(endOfMonth(subMonths(now, 1)))

		const transactions = await db
			.select({
				date: transactionsTable.date,
				type: transactionsTable.type,
				amount: transactionsTable.amount
			})
			.from(transactionsTable)
			.where(
				and(
					isNull(transactionsTable.deletedAt),
					eq(transactionsTable.userId, ctx.subjects.properties.id),
					eq(transactionsTable.status, "paid"),
					or(
						between(transactionsTable.date, currentMonthStart, currentMonthEnd),
						between(transactionsTable.date, previousMonthStart, previousMonthEnd)
					)
				)
			)

		return calculateMonthlyComparison(transactions)
	})
})
