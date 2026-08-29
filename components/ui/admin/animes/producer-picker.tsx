"use client";

import NameCollectionPicker from "@/components/ui/admin/shared/name-collection-picker";
import type { Producer } from "@/lib/types/entites/producer";

export default function ProducerPicker({
    value,
    options,
    onChange,
}: {
    value: string[];
    options: Producer[];
    onChange: (value: string[]) => void;
}) {
    return (
        <NameCollectionPicker
            value={value}
            options={options}
            onChange={onChange}
            placeholder="Введіть назву продюсера"
            emptyText="Продюсерів ще не додано"
        />
    );
}
