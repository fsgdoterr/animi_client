"use client";

import { Grid2X2, List } from "lucide-react";

import { IconButton } from "@/components/ui/buttons/icon-button";
import type { CatalogViewMode } from "@/components/ui/public/catalog/catalog-types";
import cn from "@/lib/utils/cn";

export default function CatalogViewToggle({
    value,
    onChange,
    className,
}: {
    value: CatalogViewMode;
    onChange: (mode: CatalogViewMode) => void;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex shrink-0 overflow-hidden rounded-lg border border-white/[0.07] bg-[#171d22] p-0.5",
                className,
            )}
        >
            <IconButton
                type="button"
                variant={value === "grid" ? "soft" : "ghost"}
                color={value === "grid" ? "green" : "primary"}
                className={cn("size-9 rounded-md", value !== "grid" && "text-white/45")}
                onClick={() => onChange("grid")}
                aria-label="Плитка"
                title="Плитка"
            >
                <Grid2X2 size={17} />
            </IconButton>
            <IconButton
                type="button"
                variant={value === "list" ? "soft" : "ghost"}
                color={value === "list" ? "green" : "primary"}
                className={cn("size-9 rounded-md", value !== "list" && "text-white/45")}
                onClick={() => onChange("list")}
                aria-label="Докладний список"
                title="Докладний список"
            >
                <List size={18} />
            </IconButton>
        </div>
    );
}
