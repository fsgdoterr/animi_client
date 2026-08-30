"use client";

import {
    type KeyboardEvent,
    type ReactNode,
    useEffect,
    useId,
    useState,
} from "react";

import { Check, ChevronDown } from "lucide-react";

import { useDropdown } from "@/lib/hooks/use-dropdown";
import cn from "@/lib/utils/cn";

export interface SelectOption<T extends string> {
    value: T;
    label: ReactNode;
    disabled?: boolean;
}

interface SelectProps<T extends string> {
    value: T;
    options: SelectOption<T>[];
    onChange: (value: T) => void;

    label?: string;
    placeholder?: string;

    disabled?: boolean;
    name?: string;

    className?: string;
    buttonClassName?: string;
    dropdownClassName?: string;
}

export function Select<T extends string>({
    value,
    options,
    onChange,
    label,
    placeholder = "Оберіть значення",
    disabled,
    name,
    className,
    buttonClassName,
    dropdownClassName,
}: SelectProps<T>) {
    const id = useId();

    const { rootRef, isOpen, setIsOpen } = useDropdown();
    const [activeIndex, setActiveIndex] = useState(() =>
        Math.max(
            0,
            options.findIndex((option) => option.value === value),
        ),
    );

    const selectedOption = options.find((option) => option.value === value);


    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const selectedIndex = options.findIndex(
            (option) => option.value === value,
        );

        if (selectedIndex >= 0) {
            setActiveIndex(selectedIndex);
        }
    }, [isOpen, options, value]);

    const findNextEnabledOption = (startIndex: number, direction: 1 | -1) => {
        let index = startIndex;

        for (let i = 0; i < options.length; i++) {
            index = (index + direction + options.length) % options.length;

            if (!options[index].disabled) {
                return index;
            }
        }

        return startIndex;
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === "Escape") {
            setIsOpen(false);
            return;
        }

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();

            if (!isOpen) {
                setIsOpen(true);
                return;
            }

            setActiveIndex((currentIndex) =>
                findNextEnabledOption(
                    currentIndex,
                    event.key === "ArrowDown" ? 1 : -1,
                ),
            );

            return;
        }

        if (isOpen && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();

            const option = options[activeIndex];

            if (!option || option.disabled) {
                return;
            }

            onChange(option.value);
            setIsOpen(false);
        }
    };

    const handleSelect = (option: SelectOption<T>) => {
        if (option.disabled) {
            return;
        }

        onChange(option.value);
        setIsOpen(false);
    };

    return (
        <div
            ref={rootRef}
            className={cn("relative inline-block min-w-0", className)}
        >
            {name && <input type="hidden" name={name} value={value} />}

            <button
                type="button"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={`${id}-listbox`}
                onClick={() => setIsOpen((current) => !current)}
                onKeyDown={handleKeyDown}
                className={cn(
                    "flex h-11 w-full items-center gap-1.5 rounded-lg",
                    "border border-white/[0.035] bg-[#171d22] px-3.5",
                    "text-left text-[15px] outline-none transition",
                    "hover:bg-[#1a2026]",
                    "focus:border-white/14",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    buttonClassName,
                )}
            >
                <span className="min-w-0 flex-1 truncate">
                    {label && (
                        <span className="mr-1 text-white/38">{label}:</span>
                    )}

                    <span
                        className={cn(
                            selectedOption ? "text-white/88" : "text-white/32",
                        )}
                    >
                        {selectedOption?.label ?? placeholder}
                    </span>
                </span>

                <ChevronDown
                    size={18}
                    strokeWidth={2}
                    className={cn(
                        "shrink-0 text-white/40 transition-transform duration-200",
                        isOpen && "rotate-180",
                    )}
                />
            </button>

            {isOpen && (
                <div
                    id={`${id}-listbox`}
                    role="listbox"
                    className={cn(
                        "absolute left-0 top-[calc(100%+6px)] z-50",
                        "min-w-full max-h-[170px] overflow-x-hidden overflow-y-auto rounded-lg",
                        "border border-white/[0.055] bg-[#25313b]",
                        "p-1 shadow-xl shadow-black/30",
                        dropdownClassName,
                    )}
                >
                    {options.map((option, index) => {
                        const isSelected = option.value === value;

                        const isActive = activeIndex === index;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                disabled={option.disabled}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => handleSelect(option)}
                                className={cn(
                                    "relative flex h-9 w-full items-center gap-2",
                                    "rounded-md px-3 py-1.5 text-left text-[15px]",
                                    "transition",
                                    isActive && "bg-white/[0.055]",
                                    isSelected
                                        ? "text-(--primary)"
                                        : "text-white/88",
                                    option.disabled &&
                                        "cursor-not-allowed opacity-35",
                                )}
                            >
                                <span
                                    className={cn(
                                        "absolute bottom-1.5 left-0 top-1.5 w-0.5 rounded-full",
                                        isSelected
                                            ? "bg-(--primary)"
                                            : "bg-transparent",
                                    )}
                                />

                                <span className="min-w-0 flex-1 truncate">
                                    {option.label}
                                </span>

                                {isSelected && (
                                    <Check
                                        size={16}
                                        strokeWidth={2}
                                        className="shrink-0"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
