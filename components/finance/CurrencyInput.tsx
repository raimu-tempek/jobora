"use client";

import React, { useId } from "react";
import { formatThousand, parseRawDigits, terbilangRupiah } from "@/lib/finance/format";

export interface CurrencyInputProps {
  value: number | string;
  onChange: (rawValue: string, numericValue: number) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showTerbilang?: boolean;
  name?: string;
  id?: string;
  autoFocus?: boolean;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "0",
  required = false,
  disabled = false,
  className = "",
  showTerbilang = true,
  name,
  id,
  autoFocus,
}: CurrencyInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  // Derive numeric value from string or number
  const numValue =
    typeof value === "number"
      ? value
      : parseRawDigits(String(value ?? ""));

  // If user cleared the input (empty string), display empty string so they can type cleanly
  const displayString =
    value === "" || value === undefined || value === null
      ? ""
      : numValue > 0
      ? formatThousand(numValue)
      : String(value) === "0" || value === 0
      ? "0"
      : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, "");
    const parsed = rawDigits ? parseInt(rawDigits, 10) : 0;
    // Pass rawDigits back so form states that expect numeric strings or numbers receive clean data
    onChange(rawDigits, parsed);
  };

  const terbilangText = numValue > 0 ? terbilangRupiah(numValue) : "";

  return (
    <div className="w-full">
      <div
        className={`relative flex items-center rounded-xl border border-gray-200 bg-white transition focus-within:border-[#107c74] focus-within:ring-2 focus-within:ring-[#107c74]/20 ${
          disabled ? "bg-gray-100 opacity-70" : ""
        } ${className}`}
      >
        <span className="px-3 py-2 text-xs font-bold text-gray-500 bg-gray-50 border-r border-gray-200 select-none rounded-l-xl">
          Rp
        </span>
        <input
          id={inputId}
          name={name}
          type="text"
          inputMode="numeric"
          autoFocus={autoFocus}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          value={displayString}
          onChange={handleChange}
          className="w-full px-3 py-2 text-xs font-bold text-gray-900 bg-transparent focus:outline-none placeholder:font-normal placeholder:text-gray-400"
        />
      </div>

      {showTerbilang && numValue > 0 && (
        <div className="mt-1 flex items-center justify-between text-[11px] px-1 animate-fadeIn gap-2">
          <span className="font-semibold text-[#107c74] shrink-0">
            Rp {formatThousand(numValue)}
          </span>
          {terbilangText && (
            <span
              className="text-gray-500 italic truncate text-right text-[10px]"
              title={terbilangText}
            >
              {terbilangText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
