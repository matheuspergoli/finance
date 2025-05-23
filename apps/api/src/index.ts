import { createTRPCContext } from "@/libs/trpc"
import { trpcServer } from "@hono/trpc-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { env } from "./environment/env"
import { appRouter } from "./routers/_app"

const app = new Hono()

app.use(
	"/*",
	cors({
		origin: env.FRONTEND_URL,
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"]
	})
)

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			const authorizationHeader = context.req.header("Authorization")
			const accessToken = authorizationHeader?.split(" ")[1]

			return createTRPCContext({ honoContext: context, accessToken })
		}
	})
)

app.get("/", (c) => {
	return c.text("OK")
})

export default {
	fetch: app.fetch,
	port: process.env.PORT ?? 3000
}
