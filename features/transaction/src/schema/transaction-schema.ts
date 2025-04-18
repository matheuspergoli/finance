import { z } from "zod"

export const transactionTypes = ["income", "expense"] as const
export const transactionStatuses = ["pending", "paid", "overdue", "planned"] as const
export const transactionPaymentMethods = [
	"credit_card",
	"debit_card",
	"pix",
	"boleto",
	"cash"
] as const

export type TransactionType = (typeof transactionTypes)[number]
export type TransactionStatus = (typeof transactionStatuses)[number]
export type TransactionPaymentMethod = (typeof transactionPaymentMethods)[number]

export const TransactionIdSchema = z.string().uuid()

export const CreateTransactionInputSchema = z.object({
	id: TransactionIdSchema,
	date: z.date(),
	note: z
		.string()
		.max(120, "Nota deve ter no máximo 120 caracteres")
		.transform((v) => v ?? ""),
	amount: z.number().min(1, "Valor deve ser maior que 0"),
	description: z
		.string()
		.max(120, "Descrição deve ter no máximo 120 caracteres")
		.transform((v) => v ?? ""),
	type: z.enum(transactionTypes),
	status: z.enum(transactionStatuses),
	paymentMethod: z.enum(transactionPaymentMethods)
})

export const UpdateTransactionInputSchema = CreateTransactionInputSchema

export const TransactionOutputSchema = z.object({
	id: TransactionIdSchema,
	date: z.date(),
	note: z.string(),
	amount: z.number(),
	type: z.enum(transactionTypes),
	status: z.enum(transactionStatuses),
	paymentMethod: z.enum(transactionPaymentMethods),
	description: z.string()
})

export type CreateTransactionInput = z.infer<typeof CreateTransactionInputSchema>
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionInputSchema>
export type TransactionOutput = z.infer<typeof TransactionOutputSchema>
