import { createFileRoute } from "@tanstack/react-router"
import { PageTitle } from "@/shared/components/page-title"
import { useSuspenseQuery } from "@tanstack/react-query"
import { trpc } from "@/libs/trpc"
import {
	transactionColumns,
	TransactionsTable
} from "@/features/transaction/components/transaction-table"

export const Route = createFileRoute("/dashboard/transactions")({
	component: RouteComponent,
	head: () => ({
		meta: [{ title: "Transações" }]
	}),
	loader: async ({ context: { queryClient } }) => {
		await Promise.all([
			await queryClient.prefetchQuery(trpc.transactionRouter.list.queryOptions())
		])
	}
})

function RouteComponent() {
	const { data } = useSuspenseQuery(trpc.transactionRouter.list.queryOptions())

	return (
		<main>
			<PageTitle>Transações</PageTitle>

			<section>
				<TransactionsTable columns={transactionColumns} data={data} />
			</section>
		</main>
	)
}
