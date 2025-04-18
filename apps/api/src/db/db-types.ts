import type * as schema from "./schema"

export type DBTypes = {
	[K in keyof typeof schema]: (typeof schema)[K] extends {
		$inferSelect: unknown
	}
		? (typeof schema)[K]["$inferSelect"]
		: never
}
