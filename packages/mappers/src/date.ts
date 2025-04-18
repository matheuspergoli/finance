import { ptBR } from "date-fns/locale"
import { format as formatDate, parseISO, fromUnixTime } from "date-fns"

export type DateFormat = "short" | "full" | "dateOnly" | "timeOnly" | "yearMonth"

export const dateFormatPatterns: Record<DateFormat, string> = {
	short: "dd/MM/yyyy",
	full: "dd/MM/yyyy HH:mm",
	dateOnly: "dd/MM/yyyy",
	timeOnly: "HH:mm",
	yearMonth: "MMMM yyyy"
}

/**
 * Utilitário para manipulação de datas.
 * Fornece métodos para converter, formatar e processar datas entre diferentes formatos.
 * Todas as funções lançam erro se a entrada for inválida.
 */
export const dateMapper = {
	/**
	 * Converte um timestamp (em milissegundos) para um objeto Date.
	 * @param timestamp - Timestamp em milissegundos
	 * @returns Objeto Date
	 * @throws Erro se a entrada for inválida
	 */
	fromTimestamp(timestamp: number): Date {
		if (!Number.isFinite(timestamp)) {
			throw new Error("Invalid timestamp")
		}
		const date = new Date(timestamp)
		if (Number.isNaN(date.getTime())) {
			throw new Error("Invalid date from timestamp")
		}
		return date
	},

	/**
	 * Converte um timestamp Unix (em segundos) para um objeto Date.
	 * @param unixTimestamp - Timestamp Unix em segundos
	 * @returns Objeto Date
	 * @throws Erro se a entrada for inválida
	 */
	fromUnixTimestamp(unixTimestamp: number): Date {
		if (!Number.isFinite(unixTimestamp)) {
			throw new Error("Invalid Unix timestamp")
		}
		const date = fromUnixTime(unixTimestamp)
		if (Number.isNaN(date.getTime())) {
			throw new Error("Invalid date from Unix timestamp")
		}
		return date
	},

	/**
	 * Converte uma string ISO para um objeto Date.
	 * @param isoString - String de data no formato ISO
	 * @returns Objeto Date
	 * @throws Erro se a string for inválida
	 */
	fromISOString(isoString: string): Date {
		if (typeof isoString !== "string") {
			throw new Error("ISO input must be a string")
		}
		const date = parseISO(isoString)
		if (Number.isNaN(date.getTime())) {
			throw new Error("Invalid ISO date string")
		}
		return date
	},

	/**
	 * Converte um objeto Date para timestamp em milissegundos.
	 * @param date - Objeto Date a ser convertido
	 * @returns Timestamp em milissegundos
	 * @throws Erro se a data for inválida
	 */
	toTimestamp(date: Date): number {
		if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
			throw new Error("Invalid Date object")
		}
		return date.getTime()
	},

	/**
	 * Converte um objeto Date para string no formato ISO.
	 * @param date - Objeto Date a ser convertido
	 * @returns String no formato ISO
	 * @throws Erro se a data for inválida
	 */
	toISOString(date: Date): string {
		if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
			throw new Error("Invalid Date object")
		}
		return date.toISOString()
	},

	/**
	 * Formata uma data conforme o tipo de formato especificado.
	 * @param date - Data a ser formatada (objeto Date ou timestamp)
	 * @param formatType - Tipo de formato desejado
	 * @returns Data formatada como string
	 * @throws Erro se a data for inválida
	 */
	format(date: Date | number, formatType: DateFormat = "short"): string {
		const dateObj = typeof date === "number" ? new Date(date) : date
		if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) {
			throw new Error("Invalid date input")
		}
		const pattern = dateFormatPatterns[formatType]
		return formatDate(dateObj, pattern, { locale: ptBR })
	},

	/**
	 * Prepara uma data para persistência no banco de dados.
	 * Converte para timestamp em milissegundos.
	 * @param date - Data a ser preparada para persistência
	 * @returns Timestamp em milissegundos
	 * @throws Erro se a data for inválida
	 */
	toPersistence(date: Date): number {
		return this.toTimestamp(date)
	}
}
