"use client";

import { type KeyboardEvent, useId } from "react";

import { Check, ChevronDown, Minus } from "lucide-react";

import { useDropdown } from "@/lib/hooks/use-dropdown";
import cn from "@/lib/utils/cn";

export interface MultiSelectOption<T extends string> {
    value: T;
    label: string;
    disabled?: boolean;
}

export interface MultiSelectFilterValue<T extends string> {
    include: T[];
    exclude: T[];
}

interface BaseMultiSelectProps<T extends string> {
    options: MultiSelectOption<T>[];

    label?: string;
    placeholder?: string;

    disabled?: boolean;
    className?: string;
    dropdownClassName?: string;

    maxPreviewItems?: number;
}

interface MultipleMultiSelectProps<
    T extends string,
> extends BaseMultiSelectProps<T> {
    mode?: "multiple";

    value: T[];
    onChange: (value: T[]) => void;
}

interface FilterMultiSelectProps<
    T extends string,
> extends BaseMultiSelectProps<T> {
    mode: "filter";

    value: MultiSelectFilterValue<T>;
    onChange: (value: MultiSelectFilterValue<T>) => void;
}

export type MultiSelectProps<T extends string> =
    | MultipleMultiSelectProps<T>
    | FilterMultiSelectProps<T>;

type OptionState = "neutral" | "include" | "exclude";

export function MultiSelect<T extends string>(props: MultiSelectProps<T>) {
    const {
        options,
        label,
        placeholder = "Оберіть значення",
        disabled,
        className,
        dropdownClassName,
        maxPreviewItems = 2,
    } = props;

    const id = useId();
    const { rootRef, isOpen, setIsOpen } = useDropdown();


    const getOptionState = (value: T): OptionState => {
        if (props.mode === "filter") {
            if (props.value.include.includes(value)) {
                return "include";
            }

            if (props.value.exclude.includes(value)) {
                return "exclude";
            }

            return "neutral";
        }

        return props.value.includes(value) ? "include" : "neutral";
    };

    const handleOptionClick = (option: MultiSelectOption<T>) => {
        if (option.disabled) {
            return;
        }

        if (props.mode === "filter") {
            const state = getOptionState(option.value);

            if (state === "neutral") {
                props.onChange({
                    include: [...props.value.include, option.value],
                    exclude: props.value.exclude.filter(
                        (value) => value !== option.value,
                    ),
                });

                return;
            }

            if (state === "include") {
                props.onChange({
                    include: props.value.include.filter(
                        (value) => value !== option.value,
                    ),
                    exclude: [...props.value.exclude, option.value],
                });

                return;
            }

            props.onChange({
                include: props.value.include,
                exclude: props.value.exclude.filter(
                    (value) => value !== option.value,
                ),
            });

            return;
        }

        const isSelected = props.value.includes(option.value);

        props.onChange(
            isSelected
                ? props.value.filter((value) => value !== option.value)
                : [...props.value, option.value],
        );
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === "Escape") {
            setIsOpen(false);
        }

        if (event.key === "ArrowDown" && !isOpen) {
            event.preventDefault();
            setIsOpen(true);
        }
    };

    const includeValues =
        props.mode === "filter" ? props.value.include : props.value;

    const excludeValues = props.mode === "filter" ? props.value.exclude : [];

    const includeLabels = options
        .filter((option) => includeValues.includes(option.value))
        .map((option) => option.label);

    const visibleLabels = includeLabels.slice(0, maxPreviewItems);

    const hiddenIncludeCount = includeLabels.length - visibleLabels.length;

    const hasSelection = includeValues.length > 0 || excludeValues.length > 0;

    return (
        <div
            ref={rootRef}
            className={cn("relative inline-block min-w-0", className)}
        >
            <button
                type="button"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={`${id}-listbox`}
                onClick={() => setIsOpen((value) => !value)}
                onKeyDown={handleKeyDown}
                className={cn(
                    "flex h-11 w-full items-center gap-2 rounded-lg",
                    "border border-white/[0.035] bg-[#171d22] px-3.5",
                    "text-left text-[15px] outline-none transition",
                    "hover:bg-[#1a2026]",
                    "focus:border-white/14",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                )}
            >
                <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
                    {label && (
                        <span className="shrink-0 text-white/38">{label}:</span>
                    )}

                    {!hasSelection ? (
                        <span className="truncate text-white/32">
                            {placeholder}
                        </span>
                    ) : (
                        <>
                            {visibleLabels.length > 0 && (
                                <span className="truncate text-white/88">
                                    {visibleLabels.join(", ")}
                                    {hiddenIncludeCount > 0 && "..."}
                                </span>
                            )}

                            {hiddenIncludeCount > 0 && (
                                <span className="shrink-0 text-(--green)">
                                    +{hiddenIncludeCount}
                                </span>
                            )}

                            {excludeValues.length > 0 && (
                                <span className="shrink-0 text-(--red)">
                                    -{excludeValues.length}
                                </span>
                            )}
                        </>
                    )}
                </div>

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
                    aria-multiselectable="true"
                    className={cn(
                        "absolute left-0 top-[calc(100%+6px)] z-50",
                        "min-w-full max-h-[170px] overflow-x-hidden overflow-y-auto rounded-lg",
                        "border border-white/[0.055] bg-[#25313b]",
                        "p-1 shadow-xl shadow-black/30",
                        dropdownClassName,
                    )}
                >
                    {options.map((option) => {
                        const state = getOptionState(option.value);

                        return (
                            <button
                                key={option.value}
                                type="button"
                                disabled={option.disabled}
                                onClick={() => handleOptionClick(option)}
                                className={cn(
                                    "relative flex h-9 w-full items-center gap-2 rounded-md",
                                    "px-3 py-1.5 text-left text-[15px] transition",

                                    state === "neutral" &&
                                        "text-white/88 hover:bg-white/[0.055]",

                                    state === "include" && [
                                        "text-(--green)",
                                        "[background-color:color-mix(in_srgb,var(--green)_10%,transparent)]",
                                        "hover:[background-color:color-mix(in_srgb,var(--green)_15%,transparent)]",
                                    ],

                                    state === "exclude" && [
                                        "text-(--red)",
                                        "[background-color:color-mix(in_srgb,var(--red)_9%,transparent)]",
                                        "hover:[background-color:color-mix(in_srgb,var(--red)_14%,transparent)]",
                                    ],

                                    option.disabled &&
                                        "cursor-not-allowed opacity-35",
                                )}
                            >
                                <span
                                    className={cn(
                                        "absolute bottom-1.5 left-0 top-1.5 w-0.5 rounded-full",

                                        state === "include" && "bg-(--green)",

                                        state === "exclude" && "bg-(--red)",

                                        state === "neutral" && "bg-transparent",
                                    )}
                                />

                                <span className="min-w-0 flex-1 truncate">
                                    {option.label}
                                </span>

                                {state === "include" && (
                                    <Check
                                        size={16}
                                        strokeWidth={2}
                                        className="shrink-0"
                                    />
                                )}

                                {state === "exclude" && (
                                    <Minus
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
