export type CurrencyOptions = {
	currency?: string
	locale?: string
	showSymbol?: boolean
	minimumFractionDigits?: number
	maximumFractionDigits?: number
}

const defaultOptions: Required<CurrencyOptions> = {
	currency: "BRL",
	locale: "pt-BR",
	showSymbol: true,
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
}

/**
 * Utilitário para manipulação de valores monetários.
 * Todas as funções assumem entradas válidas e lançam erro se forem violadas.
 */
export const moneyMapper = {
	/**
	 * Converte um valor em centavos para decimal.
	 * @param cents - Valor em centavos
	 * @returns Valor em decimal
	 * @throws Erro se o valor não for numérico
	 */
	fromCents(cents: number): number {
		if (!Number.isFinite(cents)) {
			throw new Error("Invalid cents value")
		}
		return cents / 100
	},

	/**
	 * Converte um valor decimal para centavos (arredondado).
	 * @param amount - Valor decimal
	 * @returns Valor em centavos
	 * @throws Erro se o valor não for numérico
	 */
	toCents(amount: number): number {
		if (!Number.isFinite(amount)) {
			throw new Error("Invalid amount")
		}
		return Math.round(amount * 100)
	},

	/**
	 * Formata um valor decimal para exibição monetária.
	 * @param amount - Valor decimal
	 * @param options - Opções de formatação
	 * @returns Valor formatado como string
	 * @throws Erro se o valor ou opções forem inválidas
	 */
	format(amount: number, options?: CurrencyOptions): string {
		if (!Number.isFinite(amount)) {
			throw new Error("Invalid amount")
		}

		const opts = { ...defaultOptions, ...options }

		if (!opts.locale || !opts.currency) {
			throw new Error("Locale and currency are required for formatting")
		}

		try {
			return new Intl.NumberFormat(opts.locale, {
				currency: opts.currency,
				style: opts.showSymbol ? "currency" : "decimal",
				minimumFractionDigits: opts.minimumFractionDigits,
				maximumFractionDigits: opts.maximumFractionDigits
			}).format(amount)
		} catch {
			throw new Error("Failed to format amount with given options")
		}
	},

	/**
	 * Converte uma string formatada para um valor decimal.
	 * @param formattedValue - String monetária formatada
	 * @param locale - Localidade usada na formatação (default: "pt-BR")
	 * @returns Valor decimal extraído
	 * @throws Erro se a string for inválida ou não puder ser convertida
	 */
	parse(formattedValue: string, locale: string = defaultOptions.locale): number {
		if (typeof formattedValue !== "string") {
			throw new Error("Formatted value must be a string")
		}

		try {
			const format = new Intl.NumberFormat(locale)
			const parts = format.formatToParts(1234.5)
			const decimalSeparator = parts.find((p) => p.type === "decimal")?.value ?? "."
			const groupSeparator = parts.find((p) => p.type === "group")?.value ?? ","

			const cleanValue = formattedValue
				.replace(/[^\d.,\-]/g, "")
				.replace(new RegExp(`\\${groupSeparator}`, "g"), "")
				.replace(new RegExp(`\\${decimalSeparator}`, "g"), ".")

			const parsed = Number.parseFloat(cleanValue)

			if (Number.isNaN(parsed)) {
				throw new Error(`Could not parse monetary string: "${formattedValue}"`)
			}

			return parsed
		} catch {
			throw new Error(`Failed to parse monetary value: "${formattedValue}"`)
		}
	},

	/**
	 * Prepara um valor decimal para persistência como centavos.
	 * @param amount - Valor decimal
	 * @returns Valor em centavos
	 * @throws Erro se o valor for inválido
	 */
	toPersistence(amount: number): number {
		return this.toCents(amount)
	}
}
