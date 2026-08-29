import type { ReactNode } from "react";

import FieldResetButton from "@/components/ui/admin/shared/field-reset-button";

import type { FieldResetConfig } from "@/components/ui/admin/shared/field-reset-config";

export function FormField({
    label,
    htmlFor,
    reset,
    error,
    children,
}: {
    label: ReactNode;
    htmlFor?: string;
    reset?: FieldResetConfig;
    error?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="grid content-start gap-2">
            <div className="flex min-h-8 items-center justify-between gap-3">
                <label htmlFor={htmlFor} className="text-[15px] text-white/80">
                    {label}
                </label>
                {reset && <FieldResetButton {...reset} />}
            </div>
            {children}
            {error && <FieldError>{error}</FieldError>}
        </div>
    );
}

export function FieldError({ children }: { children: ReactNode }) {
    return <span className="text-[13px] text-red-300/85">{children}</span>;
}
