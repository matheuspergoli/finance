import { env } from "./environment/env"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { trpcServer } from "@hono/trpc-server"
import { createTRPCContext } from "@/libs/trpc"
import { appRouter } from "./routers/_app"
import { authApp } from "@/libs/auth"

const app = new Hono()

app.use(
	"/*",
	cors({
		origin: env.FRONTEND_URL,
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"]
	})
)

app.route("/", authApp)

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
