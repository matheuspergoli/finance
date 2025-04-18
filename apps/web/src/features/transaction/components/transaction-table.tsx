import React from "react"
import { Badge } from "@/shared/components/badge"
import {
	Modal,
	ModalTitle,
	ModalHeader,
	ModalContent,
	ModalTrigger
} from "@/shared/components/modal"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger
} from "@/shared/components/dropdown-menu"
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
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
	getPaginationRowModel,
	type ColumnFiltersState,
	getFilteredRowModel
} from "@tanstack/react-table"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/shared/components/table"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
	CalendarClock,
	Check,
	Clock,
	PencilLine,
	PlusIcon,
	Search,
	Trash2,
	TriangleAlert
} from "lucide-react"
import { run } from "@/libs/utils"
import { Button } from "@/shared/components/button"
import { UpdateTransactionForm } from "./update-transaction-form"
import { moneyMapper } from "@repo/mappers/money"
import { useDeleteTransaction } from "../hooks/use-delete-transaction"
import { CreateTransactionForm } from "./create-transaction-form"
import { Checkbox } from "@/shared/components/checkbox"
import type { TransactionOutput } from "@repo/transaction/schema"
import { DataTablePagination } from "@/shared/components/data-table-pagination"
import { Input } from "@/shared/components/input"
import { useBulkDeleteTransactions } from "../hooks/use-bulk-delete-transaction"
import { useBulkUpdateTransactions } from "../hooks/use-bulk-update-transaction"

export const transactionColumns: ColumnDef<TransactionOutput>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<div>
				<Checkbox
					className="flex"
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Selecionar tudo"
				/>
			</div>
		),
		cell: ({ row }) => (
			<div>
				<Checkbox
					className="flex"
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Selecionar linha"
				/>
			</div>
		),
		enableSorting: false,
		enableHiding: false
	},
	{
		accessorKey: "type",
		header: "Tipo",
		cell: ({ row }) => {
			const type = row.original.type
			return (
				<Badge className={type === "income" ? "bg-green-500" : "bg-red-500"}>
					{type === "income" ? "Entrada" : "Saída"}
				</Badge>
			)
		}
	},
	{
		accessorKey: "description",
		header: "Descrição",
		cell: ({ row }) => {
			return <p className="truncate text-ellipsis w-70">{row.original.description}</p>
		}
	},
	{
		accessorKey: "date",
		header: "Data",
		cell: ({ row }) => {
			return format(row.original.date, "PPP", { locale: ptBR })
		}
	},
	{
		accessorKey: "amount",
		header: "Valor",
		cell: ({ row }) => {
			const amount = moneyMapper.fromCents(row.original.amount)
			const formatted = moneyMapper.format(amount)
			return <p>{formatted}</p>
		}
	},
	{
		accessorKey: "paymentMethod",
		header: "Pagamento",
		cell: ({ row }) => {
			const method = row.original.paymentMethod

			switch (method) {
				case "credit_card":
					return <Badge>Crédito</Badge>

				case "debit_card":
					return <Badge>Débito</Badge>

				case "pix":
					return <Badge>Pix</Badge>

				case "boleto":
					return <Badge>Boleto</Badge>

				case "cash":
					return <Badge>Dinheiro</Badge>
			}
		}
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.original.status
			return run(() => {
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
			})
		}
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const transaction = row.original
			const { mutate: deleteTransaction } = useDeleteTransaction()

			return (
				<div className="space-x-3 w-fit ml-auto">
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
								<AlertDialogAction onClick={() => deleteTransaction({ id: transaction.id })}>
									Apagar
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			)
		}
	}
]

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
}

export const TransactionsTable = <TData, TValue>({
	columns,
	data
}: DataTableProps<TData, TValue>) => {
	const [rowSelection, setRowSelection] = React.useState({})
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onRowSelectionChange: setRowSelection,
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnFiltersChange: setColumnFilters,
		state: {
			rowSelection,
			columnFilters
		}
	})

	const { mutateAsync: bulkDeleteTransactions } = useBulkDeleteTransactions()
	const { mutateAsync: bulkUpdateTransactions } = useBulkUpdateTransactions()

	const selectedData = table
		.getSelectedRowModel()
		.rows.map((row) => row.original) as TransactionOutput[]

	const transactionIds = selectedData.map((value) => value.id)

	const applyUpdates = <T extends object>(base: T, updates: Partial<T>): T => {
		const updated = { ...base }

		for (const key of Object.keys(updates) as (keyof T)[]) {
			const value = updates[key]
			if (value !== undefined) {
				updated[key] = value
			}
		}

		return updated
	}

	const handleBulkUpdate = async (updatedFields: Partial<TransactionOutput>) => {
		if (selectedData.length === 0) return

		const inputs: TransactionOutput[] = selectedData.map((transaction) => {
			const base: TransactionOutput = {
				id: transaction.id,
				type: transaction.type,
				note: transaction.note,
				date: transaction.date,
				status: transaction.status,
				amount: transaction.amount,
				description: transaction.description,
				paymentMethod: transaction.paymentMethod
			}

			return applyUpdates(base, updatedFields)
		})

		await bulkUpdateTransactions(inputs)
	}

	const typeFields = [
		{ label: "Entrada", value: "income" },
		{ label: "Saída", value: "expense" }
	] as const

	const paymentMethodFields = [
		{ label: "Pix", value: "pix" },
		{ label: "Boleto", value: "boleto" },
		{ label: "Dinheiro", value: "cash" },
		{ label: "Cartão de crédito", value: "credit_card" },
		{ label: "Cartão de débito", value: "debit_card" }
	] as const

	const statusFields = [
		{ label: "Pago", value: "paid" },
		{ label: "Pendente", value: "pending" },
		{ label: "Atrasado", value: "overdue" },
		{ label: "Planejado", value: "planned" }
	] as const

	return (
		<>
			<div className="py-4 space-x-3">
				<div className="flex flex-col sm:flex-row gap-4 w-full">
					<div className="flex items-center relative w-full sm:max-w-sm">
						<Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Filtrar por descrição"
							value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
							onChange={(event) =>
								table.getColumn("description")?.setFilterValue(event.target.value)
							}
							className="pl-8 w-full"
						/>
					</div>
					<div className="flex items-center relative w-full sm:max-w-sm">
						<Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Filtrar por categoria"
							value={(table.getColumn("category")?.getFilterValue() as string) ?? ""}
							onChange={(event) =>
								table.getColumn("category")?.setFilterValue(event.target.value)
							}
							className="pl-8 w-full"
						/>
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

					{transactionIds.length ? (
						<div className="ml-auto space-x-3">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline">Editar selecionados</Button>
								</DropdownMenuTrigger>

								<DropdownMenuContent className="w-56">
									<DropdownMenuGroup>
										<DropdownMenuSub>
											<DropdownMenuSubTrigger>Tipo</DropdownMenuSubTrigger>
											<DropdownMenuPortal>
												<DropdownMenuSubContent>
													{typeFields.map((type) => (
														<DropdownMenuItem
															key={type.value}
															onClick={() => handleBulkUpdate({ type: type.value })}
														>
															{type.label}
														</DropdownMenuItem>
													))}
												</DropdownMenuSubContent>
											</DropdownMenuPortal>
										</DropdownMenuSub>
									</DropdownMenuGroup>

									<DropdownMenuGroup>
										<DropdownMenuSub>
											<DropdownMenuSubTrigger>Pagamento</DropdownMenuSubTrigger>
											<DropdownMenuPortal>
												<DropdownMenuSubContent>
													{paymentMethodFields.map((method) => (
														<DropdownMenuItem
															key={method.value}
															onClick={() => handleBulkUpdate({ paymentMethod: method.value })}
														>
															{method.label}
														</DropdownMenuItem>
													))}
												</DropdownMenuSubContent>
											</DropdownMenuPortal>
										</DropdownMenuSub>
									</DropdownMenuGroup>

									<DropdownMenuGroup>
										<DropdownMenuSub>
											<DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
											<DropdownMenuPortal>
												<DropdownMenuSubContent>
													{statusFields.map((status) => (
														<DropdownMenuItem
															key={status.value}
															onClick={() => handleBulkUpdate({ status: status.value })}
														>
															{status.label}
														</DropdownMenuItem>
													))}
												</DropdownMenuSubContent>
											</DropdownMenuPortal>
										</DropdownMenuSub>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>

							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button variant="destructive">Excluir selecionados</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
										<AlertDialogDescription>
											Você está prestes a excluir{" "}
											<span className="font-bold">
												( {transactionIds.length} ){" "}
												{transactionIds.length > 1 ? "transações" : "transação"}
											</span>
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancelar</AlertDialogCancel>
										<AlertDialogAction
											onClick={async () => bulkDeleteTransactions(transactionIds)}
										>
											Excluir
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					) : null}
				</div>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											data-is-description={header.id === "description"}
											className="data-[is-description='true']:w-96"
										>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									Nenhuma transação feita.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>

				<DataTablePagination table={table} />
			</div>
		</>
	)
}
