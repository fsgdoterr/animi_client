"use client";

import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/inputs/input";

export type NameOption = {
    id: number;
    title: string;
};

export default function NameCollectionPicker({
    value,
    options,
    onChange,
    placeholder,
    emptyText,
    newSuffix = "(нове)",
}: {
    value: string[];
    options: NameOption[];
    onChange: (value: string[]) => void;
    placeholder: string;
    emptyText: string;
    newSuffix?: string;
}) {
    const [input, setInput] = useState("");

    const existingByTitle = useMemo(
        () =>
            new Map(
                options.map((option) => [
                    option.title.toLocaleLowerCase("uk-UA"),
                    option,
                ]),
            ),
        [options],
    );

    const suggestions = useMemo(() => {
        const query = input.trim().toLocaleLowerCase("uk-UA");
        if (!query) return [];

        return options
            .filter(
                (option) =>
                    !value.some(
                        (selected) =>
                            selected.toLocaleLowerCase("uk-UA") ===
                            option.title.toLocaleLowerCase("uk-UA"),
                    ) && option.title.toLocaleLowerCase("uk-UA").includes(query),
            )
            .slice(0, 6);
    }, [input, options, value]);

    const normalizedInput = input.trim();
    const inputAlreadyExists = normalizedInput
        ? existingByTitle.has(normalizedInput.toLocaleLowerCase("uk-UA"))
        : false;

    function addValue(title: string) {
        const normalized = title.trim();
        if (!normalized) return;

        const existing = existingByTitle.get(
            normalized.toLocaleLowerCase("uk-UA"),
        );
        const canonicalTitle = existing?.title ?? normalized;

        if (
            !value.some(
                (selected) =>
                    selected.toLocaleLowerCase("uk-UA") ===
                    canonicalTitle.toLocaleLowerCase("uk-UA"),
            )
        ) {
            onChange([...value, canonicalTitle]);
        }
        setInput("");
    }

    return (
        <div className="rounded-lg border border-white/[0.035] bg-[#171d22] p-2">
            <div className="flex min-h-8 flex-wrap items-center gap-1.5">
                {value.map((item) => {
                    const isNew = !existingByTitle.has(
                        item.toLocaleLowerCase("uk-UA"),
                    );

                    return (
                        <span
                            key={item}
                            className="inline-flex items-center gap-1 rounded-md border border-white/[0.07] bg-[#0e1418] px-2 py-1 text-[12px] text-white/75"
                        >
                            <span>
                                {item}
                                {isNew && (
                                    <span className="ml-1 text-(--green)">
                                        {newSuffix}
                                    </span>
                                )}
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    onChange(value.filter((valueItem) => valueItem !== item))
                                }
                                className="text-white/35 transition hover:text-white/75"
                                aria-label={`Видалити ${item}`}
                            >
                                <X size={13} />
                            </button>
                        </span>
                    );
                })}
                {value.length === 0 && (
                    <span className="px-1 text-[13px] text-white/28">{emptyText}</span>
                )}
            </div>

            <div className="relative mt-2">
                <Input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={placeholder}
                    className="h-9 bg-[#12181d] pr-10 text-[14px]"
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            addValue(input);
                        }
                    }}
                />
                <button
                    type="button"
                    onClick={() => addValue(input)}
                    disabled={!normalizedInput}
                    className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-(--green) transition hover:bg-white/[0.05] disabled:opacity-20"
                    aria-label="Додати"
                >
                    <Plus size={16} />
                </button>

                {(suggestions.length > 0 || (normalizedInput && !inputAlreadyExists)) && (
                    <div className="absolute left-0 right-0 top-[calc(100%+5px)] z-40 max-h-64 overflow-y-auto rounded-lg border border-white/[0.06] bg-[#25313b] p-1 shadow-xl shadow-black/30">
                        {suggestions.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => addValue(option.title)}
                                className="block w-full rounded-md px-3 py-2 text-left text-[14px] text-white/78 transition hover:bg-white/[0.06]"
                            >
                                {option.title}
                            </button>
                        ))}
                        {normalizedInput && !inputAlreadyExists && (
                            <button
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => addValue(normalizedInput)}
                                className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-[14px] text-white/78 transition hover:bg-white/[0.06]"
                            >
                                <span className="truncate">{normalizedInput}</span>
                                <span className="shrink-0 text-[12px] text-(--green)">
                                    {newSuffix}
                                </span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
