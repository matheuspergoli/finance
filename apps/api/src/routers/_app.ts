import { createTRPCRouter } from "@/libs/trpc"
import { userRouter } from "./user"
import { transactionRouter } from "./transaction"
import { reportRouter } from "./report"

export const appRouter = createTRPCRouter({
	userRouter,
	reportRouter,
	transactionRouter
})

export type AppRouter = typeof appRouter
