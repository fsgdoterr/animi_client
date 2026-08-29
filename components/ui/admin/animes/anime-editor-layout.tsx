import type { ReactNode } from "react";

import type { FieldResetConfig } from "@/components/ui/admin/shared/field-reset-config";
import FieldResetButton from "@/components/ui/admin/shared/field-reset-button";
import cn from "@/lib/utils/cn";

export function EditorSection({
    title,
    reset,
    children,
}: {
    title: string;
    reset?: FieldResetConfig;
    children: ReactNode;
}) {
    return (
        <section>
            <div className="mb-3 flex min-h-8 items-center justify-between gap-3">
                <h2 className="text-[16px] font-medium text-white/82">{title}</h2>
                {reset && <FieldResetButton {...reset} />}
            </div>
            {children}
        </section>
    );
}

export function EditorSideCard({
    title,
    reset,
    children,
}: {
    title: string;
    reset?: FieldResetConfig;
    children: ReactNode;
}) {
    return (
        <section className="rounded-xl border border-white/[0.025] bg-[#11171c] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.12)]">
            <div className="mb-3 flex min-h-8 items-center justify-between gap-3">
                <h2 className="text-[16px] font-medium text-white/86">{title}</h2>
                {reset && <FieldResetButton {...reset} />}
            </div>
            {children}
        </section>
    );
}

export function EditorTabButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "relative inline-flex min-h-10 items-center px-3 text-[14px] transition",
                active ? "text-white/88" : "text-white/42 hover:text-white/70",
            )}
        >
            {children}
            <span
                className={cn(
                    "absolute inset-x-2 bottom-0 h-0.5 rounded-full transition",
                    active ? "bg-(--primary)" : "bg-transparent",
                )}
            />
        </button>
    );
}
