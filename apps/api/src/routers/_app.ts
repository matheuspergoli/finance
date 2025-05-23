import { createTRPCRouter } from "@/libs/trpc"
import { reportRouter } from "./report"
import { transactionRouter } from "./transaction"
import { userRouter } from "./user"

export const appRouter = createTRPCRouter({
	userRouter,
	reportRouter,
	transactionRouter
})

export type AppRouter = typeof appRouter
