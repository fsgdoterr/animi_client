import Link from "next/link";
import { LoaderCircle } from "lucide-react";

import { getErrorMessage } from "@/lib/utils/get-error-message";

export function EntityEditLoading({
    title,
    loadingText,
}: {
    title: string;
    loadingText: string;
}) {
    return (
        <div className="flex min-h-full min-w-0 flex-1 flex-col">
            <PageTitle title={title} />
            <section className="mt-3 flex min-h-[280px] flex-1 items-center justify-center rounded-xl border border-white/[0.025] bg-[#11171c] px-4 text-center text-[15px] text-white/45 sm:min-h-[420px] lg:min-h-[610px]">
                <LoaderCircle className="mr-2 animate-spin" size={19} />
                {loadingText}
            </section>
        </div>
    );
}

export function EntityEditError({
    title,
    errorTitle,
    error,
    fallbackMessage,
    backHref,
    backLabel,
}: {
    title: string;
    errorTitle: string;
    error?: unknown;
    fallbackMessage: string;
    backHref: string;
    backLabel: string;
}) {
    return (
        <div className="flex min-h-full min-w-0 flex-1 flex-col">
            <PageTitle title={title} />
            <section className="mt-3 flex min-h-[280px] flex-1 flex-col items-center justify-center rounded-xl border border-white/[0.025] bg-[#11171c] px-5 text-center sm:min-h-[420px] lg:min-h-[520px]">
                <p className="text-[18px] text-white/75">{errorTitle}</p>
                <p className="mt-2 max-w-[420px] text-[14px] text-white/38">
                    {error ? getErrorMessage(error) : fallbackMessage}
                </p>
                <Link
                    href={backHref}
                    className="mt-5 rounded-md bg-white/[0.08] px-4 py-2.5 text-[14px] text-white/80 transition hover:bg-white/[0.12]"
                >
                    {backLabel}
                </Link>
            </section>
        </div>
    );
}

function PageTitle({ title }: { title: string }) {
    return (
        <header className="flex min-h-11 items-center px-0.5 lg:min-h-[45px]">
            <h1 className="text-[23px] leading-tight text-white/92 sm:text-[26px] sm:leading-none">
                {title}
            </h1>
        </header>
    );
}
