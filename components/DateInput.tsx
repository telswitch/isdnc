"use client";

/**
 * Masked date input.
 * Format enforced: MM/DD/YYYY
 *
 * Uses a simple fixed mask ("00/00/0000") so that each position
 * accepts exactly one digit. Date-range validation (valid month/day values)
 * is handled in the consuming form on submit rather than in the mask,
 * keeping this component simple and avoiding react-imask block configuration.
 *
 * Props:
 *  - value:      Controlled value (the masked display string)
 *  - onChange:   Called with the new masked value whenever it changes
 *  - className:  Additional Tailwind classes for the input element
 *  - id:         HTML id attribute (for label association)
 *  - disabled:   Disables the input
 */
import { IMaskInput } from "react-imask";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export default function DateInput({
  value,
  onChange,
  className = "",
  id,
  disabled = false,
}: DateInputProps) {
  return (
    <IMaskInput
      id={id}
      mask="00/00/0000"
      value={value}
      // onAccept fires when the masked value changes
      onAccept={(val: string) => onChange(val)}
      placeholder="MM/DD/YYYY"
      inputMode="numeric"
      autoComplete="off"
      disabled={disabled}
      className={className}
    />
  );
}
