import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const run = <T>(fn: () => T): T => fn()

export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs))
}
