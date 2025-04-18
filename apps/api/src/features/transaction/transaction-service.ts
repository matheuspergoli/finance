import { db } from "@/db/client"
import { dateMapper } from "@repo/mappers/date"
import type { TransactionService } from "@repo/transaction/service"
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm"
import { moneyMapper } from "@repo/mappers/money"
import { transactionsTable } from "@/db/schema"

export const transactionService: TransactionService = {
	async bulkDelete({ transactionIds, userId }) {
		const now = dateMapper.toTimestamp(new Date())

		await db
			.update(transactionsTable)
			.set({
				deletedAt: now
			})
			.where(
				and(
					inArray(transactionsTable.id, transactionIds),
					isNull(transactionsTable.deletedAt),
					eq(transactionsTable.userId, userId)
				)
			)
	},
	async bulkUpdate({ data, userId }) {
		const mapToInsertFormat = data.map((value) => ({
			userId,
			id: value.id,
			type: value.type,
			note: value.note,
			status: value.status,
			amount: value.amount,
			date: value.date.getTime(),
			description: value.description,
			paymentMethod: value.paymentMethod
		}))

		await db
			.insert(transactionsTable)
			.values(mapToInsertFormat)
			.onConflictDoUpdate({
				target: transactionsTable.id,
				set: {
					type: sql.raw(`excluded.${transactionsTable.type.name}`),
					note: sql.raw(`excluded.${transactionsTable.note.name}`),
					status: sql.raw(`excluded.${transactionsTable.status.name}`),
					amount: sql.raw(`excluded.${transactionsTable.amount.name}`),
					date: sql.raw(`excluded.${transactionsTable.date.name}`),
					description: sql.raw(`excluded.${transactionsTable.description.name}`),
					userId: sql.raw(`excluded.${transactionsTable.userId.name}`),
					paymentMethod: sql.raw(`excluded.${transactionsTable.paymentMethod.name}`)
				}
			})
	},
	async findMany({ transactionIds, userId }) {
		const transactions = await db
			.select({
				id: transactionsTable.id,
				note: transactionsTable.note,
				date: transactionsTable.date,
				type: transactionsTable.type,
				amount: transactionsTable.amount,
				status: transactionsTable.status,
				description: transactionsTable.description,
				paymentMethod: transactionsTable.paymentMethod
			})
			.from(transactionsTable)
			.where(
				and(
					isNull(transactionsTable.deletedAt),
					eq(transactionsTable.userId, userId),
					inArray(transactionsTable.id, transactionIds)
				)
			)
			.orderBy(desc(transactionsTable.updatedAt))

		return transactions.map((value) => ({
			...value,
			date: dateMapper.fromTimestamp(value.date)
		}))
	},
	async find({ userId, transactionId }) {
		const transaction = await db
			.select({
				id: transactionsTable.id,
				note: transactionsTable.note,
				date: transactionsTable.date,
				type: transactionsTable.type,
				amount: transactionsTable.amount,
				status: transactionsTable.status,
				description: transactionsTable.description,
				paymentMethod: transactionsTable.paymentMethod
			})
			.from(transactionsTable)
			.where(
				and(
					isNull(transactionsTable.deletedAt),
					eq(transactionsTable.userId, userId),
					eq(transactionsTable.id, transactionId)
				)
			)
			.get()

		if (!transaction) return undefined

		return { ...transaction, date: dateMapper.fromTimestamp(transaction.date) }
	},
	async list({ userId }) {
		const transactions = await db
			.select({
				id: transactionsTable.id,
				note: transactionsTable.note,
				date: transactionsTable.date,
				type: transactionsTable.type,
				amount: transactionsTable.amount,
				status: transactionsTable.status,
				description: transactionsTable.description,
				paymentMethod: transactionsTable.paymentMethod
			})
			.from(transactionsTable)
			.where(and(isNull(transactionsTable.deletedAt), eq(transactionsTable.userId, userId)))

		// talvez eu volte com esse
		// .orderBy(desc(transactionsTable.updatedAt))

		return transactions.map((value) => ({
			...value,
			date: dateMapper.fromTimestamp(value.date)
		}))
	},
	async create({ data, userId }) {
		await db.insert(transactionsTable).values({
			id: data.id,
			note: data.note,
			type: data.type,
			status: data.status,
			description: data.description,
			paymentMethod: data.paymentMethod,
			userId: userId,
			date: dateMapper.toTimestamp(data.date),
			amount: moneyMapper.toCents(data.amount)
		})
	},
	async update({ data, userId }) {
		await db
			.update(transactionsTable)
			.set({
				note: data.note,
				type: data.type,
				status: data.status,
				description: data.description,
				paymentMethod: data.paymentMethod,
				date: dateMapper.toTimestamp(data.date),
				amount: moneyMapper.toCents(data.amount)
			})
			.where(
				and(
					eq(transactionsTable.id, data.id),
					isNull(transactionsTable.deletedAt),
					eq(transactionsTable.userId, userId)
				)
			)
	},
	async delete({ userId, transactionId }) {
		await db
			.update(transactionsTable)
			.set({
				deletedAt: dateMapper.toTimestamp(new Date())
			})
			.where(
				and(
					eq(transactionsTable.id, transactionId),
					isNull(transactionsTable.deletedAt),
					eq(transactionsTable.userId, userId)
				)
			)
	}
}
