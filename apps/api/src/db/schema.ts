import type {
	TransactionPaymentMethod,
	TransactionStatus,
	TransactionType
} from "@repo/transaction/schema"
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { randomUUID } from "node:crypto"

export const transactionsTable = sqliteTable(
	"transactions",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		userId: text("user_id").notNull(),
		note: text("note").notNull(),
		date: integer("date").notNull(),
		amount: integer("amount").notNull(),
		description: text("description").notNull(),
		type: text("type").notNull().$type<TransactionType>(),
		status: text("status").notNull().$type<TransactionStatus>(),
		paymentMethod: text("payment_method").notNull().$type<TransactionPaymentMethod>(),
		deletedAt: integer("deleted_at"),
		createdAt: integer("created_at")
			.notNull()
			.$defaultFn(() => Date.now()),
		updatedAt: integer("updated_at")
			.notNull()
			.$defaultFn(() => Date.now())
			.$onUpdate(() => Date.now())
	},
	(table) => {
		return [
			index("transaction_date_idx").on(table.date),
			index("transaction_type_idx").on(table.type),
			index("transaction_user_idx").on(table.userId),
			index("transaction_status_idx").on(table.status),
			index("transaction_user_date_idx").on(table.userId, table.date),
			index("transaction_payment_method_idx").on(table.paymentMethod),
			index("transaction_user_type_date_idx").on(table.userId, table.type, table.date)
		]
	}
)
