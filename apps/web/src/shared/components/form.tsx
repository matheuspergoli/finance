import { cn } from "@/libs/utils"
import { moneyMapper } from "@repo/mappers/money"
import { createFormHook, createFormHookContexts, useStore } from "@tanstack/react-form"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import React from "react"
import type { NumericFormatProps } from "react-number-format"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { CurrencyInput } from "./currency-input"
import { Input } from "./input"
import { Label } from "./label"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue
} from "./select"
import { Textarea } from "./textarea"

export const { fieldContext, useFieldContext, formContext, useFormContext } =
	createFormHookContexts()

type ErrorMessagesProps = React.ComponentProps<"p">
function ErrorMessages(props: ErrorMessagesProps) {
	const field = useFieldContext()
	const errors = useStore(field.store, (state) => state.meta.errors)

	return (
		<>
			{field.state.meta.isTouched
				? errors.map((error) => (
						<div
							key={typeof error === "string" ? error : error.message}
							className="text-red-500"
							{...props}
						>
							{typeof error === "string" ? error : error.message}
						</div>
					))
				: null}
		</>
	)
}

type FieldsetProps = React.ComponentProps<"fieldset">
export function Fieldset(props: FieldsetProps) {
	const childrenArray = React.Children.toArray(props.children)

	const errorMessages = childrenArray.filter((child) => {
		return React.isValidElement(child) && child.type === ErrorMessages
	})

	const otherFields = childrenArray.filter((child) => {
		return !(React.isValidElement(child) && child.type === ErrorMessages)
	})

	return (
		<>
			<fieldset {...props}>
				<div className="space-y-1">{otherFields}</div>
				{errorMessages.length ? errorMessages : null}
			</fieldset>
		</>
	)
}

type SubscribeButtonProps = React.ComponentProps<"button">
export function SubscribeButton(props: SubscribeButtonProps) {
	const form = useFormContext()

	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button
					{...props}
					className={cn(props.className)}
					type="submit"
					mode="loading"
					isLoading={isSubmitting}
					disabled={isSubmitting}
				/>
			)}
		</form.Subscribe>
	)
}

type TextFieldProps = React.ComponentProps<"input">
export function TextField(props: TextFieldProps) {
	const field = useFieldContext<string>()

	return (
		<Input
			{...props}
			id={field.name}
			name={field.name}
			value={field.state.value}
			onBlur={field.handleBlur}
			onChange={(e) => field.handleChange(e.target.value)}
		/>
	)
}

type PasswordFieldProps = React.ComponentProps<"input">
export function PasswordField(props: PasswordFieldProps) {
	const [showPassword, setShowPassword] = React.useState(false)

	return (
		<div className="relative">
			<Input
				type={showPassword ? "text" : "password"}
				className={cn("hide-password-toggle pr-10", props.className)}
				{...props}
			/>

			<Button
				type="button"
				variant="ghost"
				size="sm"
				className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
				onClick={() => setShowPassword((prev) => !prev)}
				disabled={props.disabled}
			>
				{showPassword && !props.disabled ? (
					<EyeIcon className="h-4 w-4" aria-hidden="true" />
				) : (
					<EyeOffIcon className="h-4 w-4" aria-hidden="true" />
				)}
				<span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
			</Button>

			<style>{`
					.hide-password-toggle::-ms-reveal,
					.hide-password-toggle::-ms-clear {
						visibility: hidden;
						pointer-events: none;
						display: none;
					}
				`}</style>
		</div>
	)
}

type LabelFieldProps = React.ComponentProps<"label">
export function LabelField(props: LabelFieldProps) {
	const field = useFieldContext()

	return <Label {...props} htmlFor={field.name} />
}

type SelectFieldProps = React.ComponentProps<"select"> & {
	placeholder?: string
	label: string
	values: { label: string; value: string }[]
}
export function SelectField(props: SelectFieldProps) {
	const field = useFieldContext<string>()

	return (
		<Select
			name={field.name}
			value={field.state.value}
			onValueChange={(value) => field.handleChange(value)}
		>
			<SelectTrigger className="w-full">
				<SelectValue placeholder={props?.placeholder} />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>{props.label}</SelectLabel>
					{props.values.map((value) => (
						<SelectItem key={value.value} value={value.value}>
							{value.label}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	)
}

type TextAreaFieldProps = React.ComponentProps<"textarea">
export function TextArea(props: TextAreaFieldProps) {
	const field = useFieldContext<string>()

	return (
		<Textarea
			{...props}
			value={field.state.value}
			onBlur={field.handleBlur}
			onChange={(e) => field.handleChange(e.target.value)}
		/>
	)
}

export function CalendarField() {
	const field = useFieldContext<Date>()

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn(
						"w-full justify-start text-left font-normal",
						!field.state.value && "text-muted-foreground"
					)}
				>
					<CalendarIcon />
					{field.state.value ? (
						format(field.state.value, "PPP", { locale: ptBR })
					) : (
						<span>Seleciona uma data</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					locale={ptBR}
					selected={new Date(field.state.value)}
					onSelect={(day) => {
						field.setValue((v) => day ?? v)
					}}
				/>
			</PopoverContent>
		</Popover>
	)
}

export function NumberField(props: NumericFormatProps) {
	const field = useFieldContext<number>()

	return (
		<CurrencyInput
			{...props}
			id={field.name}
			name={field.name}
			allowNegative={false}
			onBlur={field.handleBlur}
			value={field.state.value}
			onChange={(e) => field.handleChange(moneyMapper.parse(e.target.value))}
		/>
	)
}

export const { useAppForm } = createFormHook({
	fieldComponents: {
		TextArea,
		Fieldset,
		TextField,
		LabelField,
		SelectField,
		NumberField,
		CalendarField,
		PasswordField,
		ErrorMessages
	},
	formComponents: {
		SubscribeButton
	},
	fieldContext,
	formContext
})
