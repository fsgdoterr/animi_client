"use client";

import { RotateCcw } from "lucide-react";

export default function FieldResetButton({
    disabled,
    onClick,
    ariaLabel,
}: {
    disabled: boolean;
    onClick: () => void;
    ariaLabel: string;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            aria-label={ariaLabel}
            title={ariaLabel}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-white/[0.07] bg-white/[0.025] px-2.5 text-[13px] text-white/55 transition hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white/80 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/[0.07] disabled:hover:bg-white/[0.025] disabled:hover:text-white/55"
        >
            <RotateCcw size={14} strokeWidth={1.8} />
            Скинути
        </button>
    );
}
