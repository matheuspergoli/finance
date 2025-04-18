import { initTRPC, TRPCError } from "@trpc/server"
import SuperJSON from "superjson"
import { ZodError } from "zod"
import type { Context as HonoContext } from "hono"
import { authClient, subjects } from "@/libs/auth"

export interface CreateContextOptions {
	honoContext: HonoContext
	accessToken: string | undefined
}

export const createTRPCContext = async (context: CreateContextOptions) => {
	return { ...context }
}

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create({
	transformer: SuperJSON,
	errorFormatter: ({ shape, error }) => ({
		...shape,
		data: {
			...shape.data,
			zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
		}
	})
})

const timingMiddleware = t.middleware(async ({ next, path }) => {
	const start = Date.now()

	if (t._config.isDev) {
		const waitMs = Math.floor(Math.random() * 900) + 100
		await new Promise((resolve) => setTimeout(resolve, waitMs))
	}

	const result = await next()

	const end = Date.now()
	console.log(`[TRPC] ${path} took ${end - start}ms to execute`)

	return result
})

export const publicProcedure = t.procedure.use(timingMiddleware)

export const protectedProcedure = t.procedure
	.use(timingMiddleware)
	.use(async ({ ctx, next }) => {
		if (!ctx.accessToken) {
			throw new TRPCError({
				code: "UNAUTHORIZED"
			})
		}

		const verified = await authClient.verify(subjects, ctx.accessToken)

		if (verified.err) {
			throw new TRPCError({
				code: "UNAUTHORIZED"
			})
		}

		return next({
			ctx: {
				...ctx,
				subjects: verified.subject
			}
		})
	})

export const { router: createTRPCRouter } = t
