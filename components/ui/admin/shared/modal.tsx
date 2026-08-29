"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { X } from "lucide-react";

import cn from "@/lib/utils/cn";

export default function Modal({
    open,
    title,
    onClose,
    className,
    children,
}: {
    open: boolean;
    title: string;
    onClose: () => void;
    className?: string;
    children: ReactNode;
}) {
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose, open]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-2 backdrop-blur-[2px] sm:items-center sm:p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={cn(
                    "max-h-[calc(100dvh-16px)] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11171c] shadow-2xl shadow-black/50 sm:w-[min(560px,calc(100vw-32px))] sm:max-h-[calc(100dvh-32px)]",
                    className,
                )}
            >
                <header className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-4 py-3.5 sm:px-5 sm:py-4">
                    <h2 className="truncate text-[18px] font-medium text-white/90">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex size-9 shrink-0 items-center justify-center rounded-md text-white/42 transition hover:bg-white/[0.06] hover:text-white/80"
                        aria-label="Закрити"
                    >
                        <X size={18} />
                    </button>
                </header>
                <div className="overflow-y-auto p-4 sm:p-5">{children}</div>
            </div>
        </div>
    );
}
