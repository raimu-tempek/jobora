"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
  ReactNode,
} from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOptionItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface CustomSelectProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options?: SelectOptionItem[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  size?: "sm" | "md";
  ariaLabel?: string;
  "aria-label"?: string;
  children?: ReactNode;
}

export function Select({
  value,
  defaultValue = "",
  onChange,
  options: optionsProp,
  placeholder = "Pilih opsi...",
  disabled = false,
  required = false,
  name,
  id,
  className = "",
  buttonClassName = "",
  menuClassName = "",
  size = "sm",
  ariaLabel,
  "aria-label": ariaLabelAttr,
  children,
}: CustomSelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const listboxId = `${selectId}-listbox`;

  // Parse children if passed like <option value="...">Label</option>
  const parsedOptions = React.useMemo(() => {
    if (optionsProp && optionsProp.length > 0) {
      return optionsProp.map((opt) => ({
        ...opt,
        value: String(opt.value),
      }));
    }

    const items: SelectOptionItem[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const props = child.props as any;
        const val = props.value !== undefined ? String(props.value) : "";
        const label = props.children !== undefined ? props.children : val;
        items.push({
          value: val,
          label: label,
          disabled: Boolean(props.disabled),
        });
      }
    });
    return items;
  }, [optionsProp, children]);

  // Controlled or uncontrolled value
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue || (parsedOptions[0]?.value && !placeholder ? parsedOptions[0].value : "")
  );

  const currentValue = isControlled ? String(value) : internalValue;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // Find currently selected option
  const selectedOption = parsedOptions.find((opt) => opt.value === currentValue);
  const isPlaceholderActive = !currentValue || (selectedOption && selectedOption.value === "" && placeholder);

  const openMenu = useCallback(() => {
    if (disabled) return;
    const idx = parsedOptions.findIndex((opt) => opt.value === currentValue);
    setHighlightedIndex(idx >= 0 ? idx : 0);
    setIsOpen(true);
  }, [disabled, parsedOptions, currentValue]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    if (disabled) return;
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [disabled, isOpen, closeMenu, openMenu]);

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && listboxRef.current && highlightedIndex >= 0) {
      const items = listboxRef.current.querySelectorAll("[role='option']");
      const activeEl = items[highlightedIndex] as HTMLElement | undefined;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [isOpen, highlightedIndex]);

  const selectValue = useCallback(
    (newVal: string) => {
      if (!isControlled) {
        setInternalValue(newVal);
      }
      if (onChange) {
        onChange(newVal);
      }
      setIsOpen(false);
      triggerRef.current?.focus();
    },
    [isControlled, onChange]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          openMenu();
        } else {
          setHighlightedIndex((prev) => {
            let next = prev + 1;
            while (next < parsedOptions.length && parsedOptions[next].disabled) {
              next++;
            }
            return next < parsedOptions.length ? next : prev;
          });
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          openMenu();
        } else {
          setHighlightedIndex((prev) => {
            let next = prev - 1;
            while (next >= 0 && parsedOptions[next].disabled) {
              next--;
            }
            return next >= 0 ? next : prev;
          });
        }
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        if (!isOpen) {
          openMenu();
        } else if (highlightedIndex >= 0 && highlightedIndex < parsedOptions.length) {
          const target = parsedOptions[highlightedIndex];
          if (!target.disabled) {
            selectValue(target.value);
          }
        }
        break;

      case "Escape":
        if (isOpen) {
          e.preventDefault();
          closeMenu();
          triggerRef.current?.focus();
        }
        break;

      case "Tab":
        if (isOpen) {
          closeMenu();
        }
        break;

      default:
        break;
    }
  };

  const effectiveAriaLabel = ariaLabelAttr || ariaLabel || (typeof selectedOption?.label === "string" ? selectedOption.label : placeholder);

  // Base sizing
  const sizeClasses =
    size === "sm"
      ? "text-xs py-2 px-3 rounded-xl min-h-[38px]"
      : "text-sm py-2.5 px-3.5 rounded-xl min-h-[42px]";

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full text-left ${className}`}
    >
      {/* Hidden input for form submissions */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={currentValue}
          required={required}
        />
      )}

      {/* Select Trigger */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={effectiveAriaLabel}
        disabled={disabled}
        onClick={toggleMenu}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between border bg-white transition-all outline-none font-medium ${sizeClasses} ${
          disabled
            ? "bg-gray-50/80 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
            : isOpen
            ? "border-[#107c74] ring-2 ring-[#107c74]/15 text-gray-900 shadow-xs"
            : "border-gray-200 hover:border-gray-300 text-gray-800"
        } ${buttonClassName}`}
      >
        <span
          className={`truncate block text-left ${
            isPlaceholderActive ? "text-gray-400 font-normal" : "text-gray-900"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Chevron Icon with consistent >= 8px gap */}
        <ChevronDown
          size={15}
          className={`ml-2 shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#107c74]" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <ul
          id={listboxId}
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          aria-label={effectiveAriaLabel}
          className={`absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-gray-100 bg-white py-1 shadow-xl z-50 focus:outline-none animate-in fade-in zoom-in-95 duration-100 ${menuClassName}`}
        >
          {parsedOptions.length === 0 ? (
            <li className="px-3.5 py-2.5 text-xs text-gray-400 text-center italic">
              Tidak ada pilihan
            </li>
          ) : (
            parsedOptions.map((opt, index) => {
              const isSelected = opt.value === currentValue;
              const isHighlighted = index === highlightedIndex;

              return (
                <li
                  key={`${opt.value}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled}
                  onClick={() => {
                    if (!opt.disabled) {
                      selectValue(opt.value);
                    }
                  }}
                  onMouseEnter={() => {
                    if (!opt.disabled) {
                      setHighlightedIndex(index);
                    }
                  }}
                  className={`relative flex items-center justify-between px-3.5 py-2 text-xs transition-colors cursor-pointer select-none ${
                    opt.disabled
                      ? "opacity-40 cursor-not-allowed bg-transparent text-gray-400"
                      : isSelected
                      ? "bg-[#e6faf7] text-[#107c74] font-semibold"
                      : isHighlighted
                      ? "bg-teal-50/70 text-[#107c74]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="truncate pr-2">{opt.label}</span>

                  {isSelected && (
                    <Check
                      size={14}
                      className="text-[#107c74] shrink-0 stroke-[2.5]"
                    />
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
