"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/buttons/button";
import cn from "@/lib/utils/cn";

export default function FieldResetButton({
    disabled,
    onClick,
    ariaLabel,
    className,
}: {
    disabled: boolean;
    onClick: () => void;
    ariaLabel: string;
    className?: string;
}) {
    return (
        <Button
            type="button"
            variant="secondary"
            disabled={disabled}
            onClick={onClick}
            aria-label={ariaLabel}
            title={ariaLabel}
            className={cn("h-8 gap-1.5 px-2.5 text-[13px] font-normal", className)}
        >
            <RotateCcw size={14} strokeWidth={1.8} />
            Скинути
        </Button>
    );
}
