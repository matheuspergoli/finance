import { NumericFormat, type NumericFormatProps } from "react-number-format"
import { Input } from "./input"

export const CurrencyInput = (props: NumericFormatProps) => {
	return (
		<NumericFormat
			customInput={Input}
			thousandSeparator="."
			decimalSeparator=","
			prefix="R$ "
			{...props}
		/>
	)
}
