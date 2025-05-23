import {
	ErrorComponent,
	type ErrorComponentProps,
	Link,
	rootRouteId,
	useMatch,
	useRouter
} from "@tanstack/react-router"
import { Button } from "./button"

export const DefaultCatchBoundary = ({ error }: ErrorComponentProps) => {
	const router = useRouter()
	const isRoot = useMatch({
		strict: false,
		select: (state) => state.id === rootRouteId
	})

	return (
		<div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
			<ErrorComponent error={error} />
			<div className="flex flex-wrap items-center gap-2">
				<Button
					onClick={() => {
						void router.invalidate()
					}}
				>
					Tente novamente
				</Button>
				{isRoot ? (
					<Button asChild>
						<Link to="/">Início</Link>
					</Button>
				) : (
					<Button asChild>
						<Link
							to="/"
							onClick={(e) => {
								e.preventDefault()
								window.history.back()
							}}
						>
							Voltar
						</Link>
					</Button>
				)}
			</div>
		</div>
	)
}
