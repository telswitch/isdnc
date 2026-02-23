"use client";

/**
 * Masked US phone number input.
 * Format enforced: (###) ###-####
 *
 * Uses react-imask / IMaskInput for real-time masking.
 *
 * Props:
 *  - value:      Controlled value (the masked display string)
 *  - onChange:   Called with the new masked value whenever it changes
 *  - className:  Additional Tailwind classes for the input element
 *  - id:         HTML id attribute (for label association)
 *  - disabled:   Disables the input
 */
import { IMaskInput } from "react-imask";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export default function PhoneInput({
  value,
  onChange,
  className = "",
  id,
  disabled = false,
}: PhoneInputProps) {
  return (
    <IMaskInput
      id={id}
      mask="(000) 000-0000"
      value={value}
      // onAccept fires when the masked value changes (use instead of onChange)
      onAccept={(val: string) => onChange(val)}
      placeholder="(___) ___-____"
      inputMode="numeric"
      autoComplete="tel"
      disabled={disabled}
      className={className}
    />
  );
}
