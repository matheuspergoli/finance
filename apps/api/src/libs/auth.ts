import { z } from "zod"
import { dbClient } from "@/db/client"
import { getBaseUrl } from "@repo/utils"
import { getGithubUser } from "@repo/auth/utils/github"
import { getGoogleUser } from "@repo/auth/utils/google"
import { TursoStorage } from "@repo/auth/storage/turso"
import { CustomSelect } from "@repo/auth/ui/custom-select"
import { createClient } from "@repo/auth/client"
import { issuer } from "@repo/auth/issuer"
import { createSubjects } from "@repo/auth/subjects"
import { GithubProvider, GoogleProvider } from "@repo/auth/providers"
import { env } from "@/environment/env"

export const authClient = createClient({
	clientID: "hono",
	issuer: getBaseUrl()
})

export const subjects = createSubjects({
	user: z.object({
		id: z.string(),
		email: z.string()
	})
})

export const authApp = issuer({
	subjects,
	theme: {
		radius: "sm",
		title: "Minhas Finanças",
		background: { light: "oklch(0.99 0 0)", dark: "oklch(0 0 0)" },
		primary: { light: "oklch(0 0 0)", dark: "oklch(1 0 0)" }
	},
	select: CustomSelect(),
	storage: TursoStorage(dbClient),
	providers: {
		github: GithubProvider({
			scopes: ["user:email", "profile"],
			clientID: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET
		}),
		google: GoogleProvider({
			scopes: ["email", "profile"],
			clientID: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET
		})
	},
	async allow(input) {
		return input.redirectURI === env.FRONTEND_URL
	},
	success: async (ctx, value) => {
		if (value.provider === "github") {
			const githubUser = await getGithubUser({ accessToken: value.tokenset.access })

			return ctx.subject("user", {
				id: githubUser.id,
				email: githubUser.email
			})
		}

		if (value.provider === "google") {
			const googleUser = await getGoogleUser({ accessToken: value.tokenset.access })

			return ctx.subject("user", {
				id: googleUser.sub,
				email: googleUser.email
			})
		}

		throw new Error("Invalid Provider")
	}
})
