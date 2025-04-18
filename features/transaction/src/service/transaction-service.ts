import type {
	CreateTransactionInput,
	TransactionOutput,
	UpdateTransactionInput
} from "../schema/transaction-schema"

export interface TransactionService {
	bulkDelete: (props: { transactionIds: string[]; userId: string }) => Promise<void>
	bulkUpdate: (props: { data: TransactionOutput[]; userId: string }) => Promise<void>
	list: (props: { userId: string }) => Promise<TransactionOutput[]>
	delete: (props: { transactionId: string; userId: string }) => Promise<void>
	create: (props: { data: CreateTransactionInput; userId: string }) => Promise<void>
	update: (props: { data: UpdateTransactionInput; userId: string }) => Promise<void>
	find: (props: { transactionId: string; userId: string }) => Promise<
		TransactionOutput | undefined
	>
	findMany: (props: {
		userId: string
		transactionIds: string[]
	}) => Promise<TransactionOutput[]>
}
