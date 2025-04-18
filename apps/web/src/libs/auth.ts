import { z } from "zod"
import { router } from "@/router"
import { env } from "@/environment/env"
import { createClient } from "@repo/auth/client"
import { queryClient } from "./trpc"

const ACCESS_KEY = "access_token"
const REFRESH_KEY = "refresh_token"
const CHALLENGE_KEY = "challenge_token"

const ChallengeSchema = z.object({ verifier: z.string(), state: z.string() })

const client = createClient({
	clientID: "vite",
	issuer: env.VITE_BACKEND_URL
})

const tokenStorage = {
	getChallengeToken: () => sessionStorage.getItem(CHALLENGE_KEY),
	setChallengeToken: (token: string) => sessionStorage.setItem(CHALLENGE_KEY, token),
	removeChallengeToken: () => sessionStorage.removeItem(CHALLENGE_KEY),

	getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
	setRefreshToken: (token: string) => localStorage.setItem(REFRESH_KEY, token),
	removeRefreshToken: () => localStorage.removeItem(REFRESH_KEY),

	getAccessToken: () => localStorage.getItem(ACCESS_KEY),
	setAccessToken: (token: string) => localStorage.setItem(ACCESS_KEY, token),
	removeAccessToken: () => localStorage.removeItem(ACCESS_KEY),

	clearTokens: () => {
		localStorage.removeItem(ACCESS_KEY)
		localStorage.removeItem(REFRESH_KEY)
		sessionStorage.removeItem(CHALLENGE_KEY)
	}
}

const login = async () => {
	const { challenge, url } = await client.authorize(location.origin, "code", {
		pkce: true
	})

	tokenStorage.setChallengeToken(JSON.stringify(challenge))

	location.href = url
}

const logout = async () => {
	tokenStorage.clearTokens()

	await queryClient.invalidateQueries()

	router.invalidate().finally(() => {
		router.navigate({ to: "/", replace: true })
	})
}

const callback = async ({ code, state }: { code: string; state: string }) => {
	const unparsedChallenge = JSON.parse(tokenStorage.getChallengeToken() ?? "{}")

	tokenStorage.removeChallengeToken()

	const parsedChallenge = ChallengeSchema.safeParse(unparsedChallenge)

	const handleErrorNavigation = (errorDetails?: Record<string, unknown>) => {
		router.navigate({ to: "/", replace: true, search: errorDetails })
	}

	if (!parsedChallenge.success) {
		handleErrorNavigation({ error: "challenge_parse_error" })
		return
	}

	if (!code) {
		handleErrorNavigation({ error: "no_code" })
		return
	}

	const { data: challenge } = parsedChallenge

	if (state !== challenge.state || !challenge.verifier) {
		handleErrorNavigation({ error: "invalid_callback_state" })
		return
	}

	const exchanged = await client.exchange(code, location.origin, challenge.verifier)

	if (exchanged.err) {
		handleErrorNavigation({ error: "token_exchange_failed" })
		return
	}

	tokenStorage.setAccessToken(exchanged.tokens.access)
	tokenStorage.setRefreshToken(exchanged.tokens.refresh)

	await queryClient.invalidateQueries()

	router.navigate({ to: "/", replace: true })
}

const refreshTokens = async () => {
	const storedAccessToken = tokenStorage.getAccessToken()
	const storedRefreshToken = tokenStorage.getRefreshToken()

	if (!storedRefreshToken) return null

	const next = await client.refresh(storedRefreshToken, {
		access: storedAccessToken ?? undefined
	})

	if (next.err) {
		logout()

		return null
	}

	if (next.tokens) {
		tokenStorage.setAccessToken(next.tokens.access)
		tokenStorage.setRefreshToken(next.tokens.refresh)

		await queryClient.invalidateQueries()

		return next.tokens.access
	}

	return storedAccessToken
}

const initializeAuth = async () => {
	const currentAccessToken = tokenStorage.getAccessToken()

	if (currentAccessToken) {
		return currentAccessToken
	}

	const currentRefreshToken = tokenStorage.getRefreshToken()

	if (currentRefreshToken) {
		const newAccessToken = await refreshTokens()

		if (newAccessToken) {
			return newAccessToken
		}
	}

	tokenStorage.clearTokens()

	return null
}

export const auth = {
	client,
	login,
	logout,
	callback,
	tokenStorage,
	refreshTokens,
	initializeAuth
}
