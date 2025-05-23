import { transactionService } from "@/features/transaction/transaction-service"
import { createTRPCRouter, protectedProcedure } from "@/libs/trpc"
import {
	CreateTransactionInputSchema,
	TransactionIdSchema,
	TransactionOutputSchema,
	UpdateTransactionInputSchema
} from "@repo/transaction/schema"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

export const transactionRouter = createTRPCRouter({
	list: protectedProcedure.output(z.array(TransactionOutputSchema)).query(async ({ ctx }) => {
		return await transactionService.list({ userId: ctx.subjects.properties.id })
	}),
	create: protectedProcedure
		.input(CreateTransactionInputSchema)
		.mutation(async ({ input, ctx }) => {
			await transactionService.create({ data: input, userId: ctx.subjects.properties.id })
		}),
	bulkDelete: protectedProcedure
		.input(z.array(TransactionIdSchema))
		.mutation(async ({ input, ctx }) => {
			const transactions = await transactionService.findMany({
				transactionIds: input,
				userId: ctx.subjects.properties.id
			})

			if (transactions.length !== input.length) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Uma ou mais transações não foram encontradas"
				})
			}

			await transactionService.bulkDelete({
				transactionIds: input,
				userId: ctx.subjects.properties.id
			})
		}),
	bulkUpdate: protectedProcedure
		.input(z.array(TransactionOutputSchema))
		.mutation(async ({ input, ctx }) => {
			await transactionService.bulkUpdate({
				data: input,
				userId: ctx.subjects.properties.id
			})
		}),
	update: protectedProcedure
		.input(UpdateTransactionInputSchema)
		.mutation(async ({ input, ctx }) => {
			const transaction = await transactionService.find({
				transactionId: input.id,
				userId: ctx.subjects.properties.id
			})

			if (!transaction) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Transação não encontrada"
				})
			}

			await transactionService.update({ data: input, userId: ctx.subjects.properties.id })
		}),
	delete: protectedProcedure
		.input(z.object({ id: TransactionIdSchema }))
		.mutation(async ({ input, ctx }) => {
			const transaction = await transactionService.find({
				transactionId: input.id,
				userId: ctx.subjects.properties.id
			})

			if (!transaction) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Transação não encontrada"
				})
			}

			await transactionService.delete({
				transactionId: input.id,
				userId: ctx.subjects.properties.id
			})
		})
})
