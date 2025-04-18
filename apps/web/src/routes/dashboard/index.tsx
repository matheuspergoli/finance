import { PageTitle } from "@/shared/components/page-title"
import { createFileRoute } from "@tanstack/react-router"
import {
	Card,
	CardDescription,
	CardFooter,
	CardContent,
	CardHeader,
	CardTitle
} from "@/shared/components/card"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from "@/shared/components/alert-dialog"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/chart"
import { Badge } from "@/shared/components/badge"
import {
	ArrowDownLeft,
	ArrowUpRight,
	CalendarClock,
	Check,
	Clock,
	PencilLine,
	PlusIcon,
	Trash2,
	TrendingDownIcon,
	TrendingUpIcon,
	TriangleAlert
} from "lucide-react"
import {
	Modal,
	ModalTitle,
	ModalHeader,
	ModalContent,
	ModalTrigger
} from "@/shared/components/modal"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Button } from "@/shared/components/button"
import { useSuspenseQuery } from "@tanstack/react-query"
import { trpc } from "@/libs/trpc"
import { capitalize } from "@repo/utils"
import { format, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { UpdateTransactionForm } from "@/features/transaction/components/update-transaction-form"
import { moneyMapper } from "@repo/mappers/money"
import { CreateTransactionForm } from "@/features/transaction/components/create-transaction-form"
import { useDeleteTransaction } from "@/features/transaction/hooks/use-delete-transaction"
import type { TransactionStatus } from "@repo/transaction/schema"

export const Route = createFileRoute("/dashboard/")({
	component: RouteComponent,
	head: () => ({
		meta: [{ title: "Dashboard" }]
	}),
	loader: async ({ context: { queryClient } }) => {
		await Promise.all([
			await queryClient.prefetchQuery(trpc.transactionRouter.list.queryOptions()),
			await queryClient.prefetchQuery(trpc.reportRouter.monthlyComparison.queryOptions()),
			await queryClient.prefetchQuery(trpc.reportRouter.listMonthlySummary.queryOptions())
		])
	}
})

function RouteComponent() {
	const { mutate: deleteTransaction } = useDeleteTransaction()
	const { data: balance } = useSuspenseQuery(trpc.reportRouter.balance.queryOptions())
	const { data: transactions } = useSuspenseQuery(trpc.transactionRouter.list.queryOptions())
	const { data: chartBarData } = useSuspenseQuery(
		trpc.reportRouter.listMonthlySummary.queryOptions()
	)
	const { data: monthlyComparison } = useSuspenseQuery(
		trpc.reportRouter.monthlyComparison.queryOptions()
	)

	const displayCurrency = (amount: number) => {
		return moneyMapper.format(moneyMapper.fromCents(amount))
	}

	const displayStatus = (status: TransactionStatus) => {
		switch (status) {
			case "pending":
				return (
					<Badge className="border-yellow-500 text-yellow-500 bg-transparent">
						<Clock /> Pendente
					</Badge>
				)

			case "paid":
				return (
					<Badge className="border-green-500 text-green-500 bg-transparent">
						<Check /> Pago
					</Badge>
				)

			case "overdue":
				return (
					<Badge className="border-red-500 text-red-500 bg-transparent">
						<TriangleAlert /> Atrasado
					</Badge>
				)

			case "planned":
				return (
					<Badge className="border-blue-500 text-blue-500 bg-transparent">
						<CalendarClock /> Planejado
					</Badge>
				)
		}
	}

	return (
		<main>
			<PageTitle>Visão Geral</PageTitle>

			<section className="grid grid-cols-3 gap-3 mb-3">
				<Card className="@container/card">
					<CardHeader>
						<CardDescription>Entradas</CardDescription>
						<CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums text-green-500">
							{displayCurrency(monthlyComparison.income.currentTotal)}
						</CardTitle>
					</CardHeader>
					<CardFooter className="flex-col items-start gap-1 text-sm">
						<div className="line-clamp-1 flex gap-2 font-medium">
							Entradas pagas do mês anterior:{" "}
							<span>{displayCurrency(monthlyComparison.income.previousTotal)}</span>
						</div>
						<div className="text-muted-foreground flex items-center gap-3">
							<div>
								<span>
									{capitalize(format(subMonths(new Date(), 1), "MMMM", { locale: ptBR }))}
								</span>
								<span> - </span>
								<span>{capitalize(format(new Date(), "MMMM", { locale: ptBR }))}</span>
							</div>
							<Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
								<TrendingUpIcon className="size-3" />
								{monthlyComparison.income.percentageChange.toFixed(2)}%
							</Badge>
						</div>
					</CardFooter>
				</Card>

				<Card className="@container/card">
					<CardHeader>
						<CardDescription>Saídas</CardDescription>
						<CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums text-red-500">
							{displayCurrency(monthlyComparison.expense.currentTotal)}
						</CardTitle>
					</CardHeader>
					<CardFooter className="flex-col items-start gap-1 text-sm">
						<div className="line-clamp-1 flex gap-2 font-medium">
							Saídas pagas do mês anterior:{" "}
							<span>{displayCurrency(monthlyComparison.expense.previousTotal)}</span>
						</div>
						<div className="text-muted-foreground flex items-center gap-3">
							<div>
								<span>
									{capitalize(format(subMonths(new Date(), 1), "MMMM", { locale: ptBR }))}
								</span>
								<span> - </span>
								<span>{capitalize(format(new Date(), "MMMM", { locale: ptBR }))}</span>
							</div>
							<Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
								<TrendingDownIcon className="size-3" />
								{monthlyComparison.expense.percentageChange.toFixed(2)}%
							</Badge>
						</div>
					</CardFooter>
				</Card>

				<Card className="@container/card">
					<CardHeader>
						<CardDescription>Saldo</CardDescription>
						<CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
							{displayCurrency(balance)}
						</CardTitle>
					</CardHeader>
					<CardFooter className="text-sm">
						Saldo baseado nas entradas e saídas pagas
					</CardFooter>
				</Card>
			</section>

			<section className="grid grid-cols-2 gap-3">
				<Card>
					<CardHeader className="flex justify-between items-center">
						<div>
							<CardTitle>Transações Recentes</CardTitle>
							<CardDescription>Suas últimas movimentações financeiras</CardDescription>
						</div>

						<Modal>
							<ModalTrigger asChild>
								<Button variant="outline">
									<PlusIcon /> Nova transação
								</Button>
							</ModalTrigger>
							<ModalContent>
								<ModalHeader>
									<ModalTitle>Crie uma nova transação</ModalTitle>
								</ModalHeader>

								<CreateTransactionForm />
							</ModalContent>
						</Modal>
					</CardHeader>
					<CardContent>
						<div className="divide-y">
							{transactions.slice(0, 5).map((transaction) => (
								<div
									key={transaction.id}
									className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
								>
									<div className="flex items-center space-x-4">
										<div
											className={`p-2 rounded-full ${
												transaction.type === "income"
													? "bg-green-100 text-green-500"
													: "bg-red-100 text-red-500"
											}`}
										>
											{transaction.type === "income" ? (
												<ArrowUpRight className="h-5 w-5" />
											) : (
												<ArrowDownLeft className="h-5 w-5" />
											)}
										</div>
										{displayStatus(transaction.status)}
										<div>
											<p className="font-medium">
												{transaction.type === "income" ? "Entrada" : "Saída"}
											</p>
										</div>
									</div>
									<div className="flex items-center space-x-2">
										<div className="text-right">
											<p
												className={`font-medium ${transaction.type === "income" ? "text-green-500" : "text-red-500"}`}
											>
												{transaction.type === "income" ? "+" : "-"}{" "}
												{displayCurrency(transaction.amount)}
											</p>
											<p className="text-xs text-muted-foreground">
												{format(transaction.date, "PPP", { locale: ptBR })}
											</p>
										</div>
										<div className="space-x-3">
											<Modal>
												<ModalTrigger asChild>
													<Button
														variant="outline"
														size="icon"
														className="h-8 w-8 text-muted-foreground hover:text-foreground"
													>
														<PencilLine className="h-4 w-4" />
													</Button>
												</ModalTrigger>
												<ModalContent>
													<ModalHeader>
														<ModalTitle>Atualize sua transação</ModalTitle>
													</ModalHeader>

													<UpdateTransactionForm
														id={transaction.id}
														note={transaction.note}
														type={transaction.type}
														date={transaction.date}
														amount={transaction.amount}
														status={transaction.status}
														description={transaction.description}
														paymentMethod={transaction.paymentMethod}
													/>
												</ModalContent>
											</Modal>

											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="destructive"
														size="icon"
														className="h-8 w-8 text-muted-foreground hover:text-foreground"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Tem certeza?</AlertDialogTitle>
														<AlertDialogDescription>
															Você está prestes a apagar sua transação
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancelar</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => deleteTransaction({ id: transaction.id })}
														>
															Apagar
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Comparação por mês das transações pagas</CardTitle>
						<CardDescription>Janeiro - Dezembro {new Date().getFullYear()}</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={{
								income: {
									label: "Entrada",
									color: "#22c55e"
								},
								expense: {
									label: "Saída",
									color: "#ef4444"
								}
							}}
						>
							<BarChart accessibilityLayer data={chartBarData}>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="month"
									tickLine={false}
									tickMargin={10}
									axisLine={false}
									tickFormatter={(value) => value.slice(0, 3)}
								/>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent indicator="dashed" valueFormat="currency" />}
								/>
								<Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
								<Bar dataKey="income" fill="var(--color-income)" radius={4} />
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>
			</section>
		</main>
	)
}
