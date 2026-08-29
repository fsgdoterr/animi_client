import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, LoaderCircle, Save } from "lucide-react";

import { Button } from "@/components/ui/buttons/button";
import ErrorAlert from "@/components/ui/admin/shared/error-alert";
import { formatDate } from "@/lib/utils/format-date";
import cn from "@/lib/utils/cn";

export function EditorHeader({
    backHref,
    backLabel,
    title,
    subtitle,
    isSaving,
    submitLabel,
}: {
    backHref: string;
    backLabel: string;
    title: string;
    subtitle?: string;
    isSaving: boolean;
    submitLabel: string;
}) {
    return (
        <header className="flex shrink-0 flex-col gap-3 px-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-start gap-2 sm:gap-3">
                <Link
                    href={backHref}
                    aria-label={backLabel}
                    className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md text-white/50 transition hover:bg-white/[0.05] hover:text-white"
                >
                    <ArrowLeft size={20} strokeWidth={1.8} />
                </Link>
                <div className="min-w-0">
                    <h1 className="text-[23px] leading-tight text-white/92 sm:truncate sm:text-[26px]">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-1 truncate text-[14px] text-white/38">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            <Button
                color="green"
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto"
            >
                {isSaving ? (
                    <LoaderCircle size={17} className="animate-spin" />
                ) : (
                    <Save size={17} strokeWidth={2} />
                )}
                {submitLabel}
            </Button>
        </header>
    );
}

export function EditorError({ error }: { error: unknown }) {
    return <ErrorAlert error={error} />;
}

export function EditorBody({
    children,
    sidebar,
}: {
    children: ReactNode;
    sidebar?: ReactNode;
}) {
    return (
        <div
            className={cn(
                "mt-3 grid gap-4 lg:min-h-0 lg:flex-1",
                sidebar && "xl:grid-cols-[minmax(0,1fr)_320px]",
            )}
        >
            {children}
            {sidebar && (
                <aside className="min-h-0 xl:overflow-y-auto">{sidebar}</aside>
            )}
        </div>
    );
}

export function EditorPanel({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn(
                "rounded-xl border border-white/[0.025] bg-[#11171c] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.12)] sm:p-6 lg:min-h-0 lg:overflow-y-auto",
                className,
            )}
        >
            {children}
        </section>
    );
}

export function SystemInfoCard({
    id,
    createdAt,
    updatedAt,
}: {
    id: number;
    createdAt: string;
    updatedAt?: string;
}) {
    return (
        <section className="rounded-xl border border-white/[0.025] bg-[#11171c] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.12)]">
            <h2 className="mb-3 text-[16px] font-medium text-white/86">
                Системна інформація
            </h2>
            <dl className="grid gap-3 text-[14px]">
                <div className="flex items-center justify-between gap-3">
                    <dt className="text-white/35">ID</dt>
                    <dd className="text-white/70">#{id}</dd>
                </div>
                <SystemInfoRow label="Створено" value={formatDate(createdAt)} />
                {updatedAt && (
                    <SystemInfoRow
                        label="Остання зміна"
                        value={formatDate(updatedAt)}
                    />
                )}
            </dl>
        </section>
    );
}

function SystemInfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid gap-1 border-t border-white/[0.05] pt-3">
            <dt className="text-white/35">{label}</dt>
            <dd className="text-white/68">{value}</dd>
        </div>
    );
}
