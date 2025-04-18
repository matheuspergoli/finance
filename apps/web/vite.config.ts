import tsconfigpaths from "vite-tsconfig-paths"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import { defineConfig } from "vite"

export default defineConfig({
	plugins: [
		TanStackRouterVite({
			quoteStyle: "double",
			routeToken: "layout",
			autoCodeSplitting: true,
			routesDirectory: "./src/routes",
			generatedRouteTree: "./src/routeTree.gen.ts"
		}),
		react(),
		tailwindcss(),
		tsconfigpaths()
	]
})
