"use client";

import NameCollectionPicker from "@/components/ui/admin/shared/name-collection-picker";
import type { Genre } from "@/lib/types/entites/genre";

export default function GenrePicker({
    value,
    options,
    onChange,
}: {
    value: string[];
    options: Genre[];
    onChange: (value: string[]) => void;
}) {
    return (
        <NameCollectionPicker
            value={value}
            options={options}
            onChange={onChange}
            placeholder="Введіть назву жанру"
            emptyText="Жанри ще не додані"
        />
    );
}
