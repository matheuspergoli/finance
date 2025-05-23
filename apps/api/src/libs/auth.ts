import { env } from "@/environment/env"
import { createClient } from "@openauthjs/openauth/client"
import { createSubjects } from "@openauthjs/openauth/subject"
import { z } from "zod"

export const authClient = createClient({
	clientID: "finance",
	issuer: env.DRAFTAUTH_URL
})

export const subjects = createSubjects({
	user: z.object({
		id: z.string(),
		email: z.string()
	})
})
