import { Input } from "./input"
import { NumericFormat, type NumericFormatProps } from "react-number-format"

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
