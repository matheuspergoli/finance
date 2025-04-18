import { createTRPCRouter, publicProcedure } from "@/libs/trpc"
import { authClient, subjects } from "@/libs/auth"

export const userRouter = createTRPCRouter({
	user: publicProcedure.query(async ({ ctx }) => {
		const verified = await authClient.verify(subjects, ctx.accessToken ?? "")

		if (verified.err) return null

		return verified.subject.properties
	})
})
