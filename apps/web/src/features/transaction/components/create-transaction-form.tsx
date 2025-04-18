import { useAppForm } from "@/shared/components/form"
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
} from "@/shared/components/accordion"
import { v4 } from "uuid"
import { useCreateTransaction } from "../hooks/use-create-transaction"
import {
	CreateTransactionInputSchema,
	type CreateTransactionInput
} from "@repo/transaction/schema"

export const CreateTransactionForm = () => {
	const { mutateAsync: createTransaction } = useCreateTransaction()

	const form = useAppForm({
		defaultValues: {
			id: v4(),
			note: "",
			amount: 0,
			type: "income",
			description: "",
			date: new Date(),
			status: "pending",
			paymentMethod: "credit_card"
		} as CreateTransactionInput,
		onSubmit: async ({ value }) => {
			await createTransaction(value)
			form.reset()
			form.setFieldValue("id", () => v4())
		},
		validators: {
			onSubmit: CreateTransactionInputSchema
		}
	})

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				e.stopPropagation()
				form.handleSubmit()
			}}
			className="space-y-5"
		>
			<form.AppField name="description">
				{(field) => (
					<field.Fieldset>
						<field.LabelField>
							Descrição
							<span className="text-sm text-muted-foreground">(Opcional)</span>
						</field.LabelField>
						<field.TextArea placeholder="Minha nova transação..." />
						<field.ErrorMessages />
					</field.Fieldset>
				)}
			</form.AppField>

			<form.AppField name="type">
				{(field) => (
					<field.Fieldset>
						<field.LabelField>Tipo</field.LabelField>
						<field.SelectField
							label="Tipo"
							placeholder="Escolha um tipo"
							values={[
								{ label: "Entrada", value: "income" },
								{ label: "Saída", value: "expense" }
							]}
						/>
						<field.ErrorMessages />
					</field.Fieldset>
				)}
			</form.AppField>

			<div className="flex gap-5 [&>*]:flex-1">
				<form.AppField name="status">
					{(field) => (
						<field.Fieldset>
							<field.LabelField>Status</field.LabelField>
							<field.SelectField
								label="Status da transação"
								placeholder="Escolha um status"
								values={[
									{ label: "Pago", value: "paid" },
									{ label: "Pendente", value: "pending" },
									{ label: "Atrasado", value: "overdue" },
									{ label: "Planejado", value: "planned" }
								]}
							/>
							<field.ErrorMessages />
						</field.Fieldset>
					)}
				</form.AppField>

				<form.AppField name="date">
					{(field) => (
						<field.Fieldset>
							<field.LabelField>Data</field.LabelField>
							<field.CalendarField />
							<field.ErrorMessages />
						</field.Fieldset>
					)}
				</form.AppField>
			</div>

			<div className="flex gap-5 [&>*]:flex-1">
				<form.AppField name="amount">
					{(field) => (
						<field.Fieldset>
							<field.LabelField>Quantidade</field.LabelField>
							<field.NumberField />
							<field.ErrorMessages />
						</field.Fieldset>
					)}
				</form.AppField>

				<form.AppField name="paymentMethod">
					{(field) => (
						<field.Fieldset>
							<field.LabelField>Método de pagamento</field.LabelField>
							<field.SelectField
								label="Método de pagamento"
								placeholder="Escolha um método"
								values={[
									{ label: "Pix", value: "pix" },
									{ label: "Boleto", value: "boleto" },
									{ label: "Dinheiro", value: "cash" },
									{ label: "Cartão de Débito", value: "debit_card" },
									{ label: "Cartão de Crédito", value: "credit_card" }
								]}
							/>
							<field.ErrorMessages />
						</field.Fieldset>
					)}
				</form.AppField>
			</div>

			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger type="button">Adicionar nota?</AccordionTrigger>
					<AccordionContent>
						<form.AppField name="note">
							{(field) => (
								<field.Fieldset>
									<field.TextArea placeholder="..." />
									<field.ErrorMessages />
								</field.Fieldset>
							)}
						</form.AppField>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<form.AppForm>
				<form.SubscribeButton className="w-full">Criar</form.SubscribeButton>
			</form.AppForm>
		</form>
	)
}
