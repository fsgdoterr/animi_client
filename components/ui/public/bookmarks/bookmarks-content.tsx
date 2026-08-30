"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, LoaderCircle, LockKeyhole, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { useAppSelector } from "@/lib/hooks/redux";
import {
    useGetPublicBookmarksQuery,
    useRemovePublicBookmarkMutation,
} from "@/lib/store/animi/public-endpoints";
import type { PublicBookmark } from "@/lib/types/public";
import { animeStatusLabels, animeTypeLabels, imageSrc } from "@/lib/utils/public-anime";

const PAGE_SIZE = 30;

export default function BookmarksContent() {
    const user = useAppSelector((state) => state.auth.user);
    const [page, setPage] = useState(1);
    const { data, isFetching, isError } = useGetPublicBookmarksQuery(
        { page, limit: PAGE_SIZE },
        { skip: !user },
    );

    useEffect(() => {
        if (data && page > data.totalPages) setPage(data.totalPages);
    }, [data, page]);

    if (!user) {
        return (
            <PageShell>
                <div className="grid min-h-[420px] place-items-center rounded-[22px] border border-white/[0.055] bg-[#10161b] px-6 text-center">
                    <div className="max-w-[430px]">
                        <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-white/[0.06] bg-white/[0.035] text-white/24">
                            <LockKeyhole size={24} />
                        </div>
                        <h1 className="mt-4 text-[22px] font-medium text-white/88">Закладки приватні</h1>
                        <p className="mt-2 text-[13px] leading-5 text-white/36">
                            Увійди, щоб швидко зберігати аніме та повертатися до них пізніше.
                        </p>
                        <button
                            type="button"
                            onClick={() => window.dispatchEvent(new Event("animi:open-auth"))}
                            className="mt-5 h-10 cursor-pointer rounded-xl bg-(--primary) px-5 text-[14px] font-medium text-white transition hover:bg-(--primary-3)"
                        >
                            Увійти
                        </button>
                    </div>
                </div>
            </PageShell>
        );
    }

    const items = data?.items ?? [];

    return (
        <PageShell>
            <section className="relative overflow-hidden rounded-[22px] border border-white/[0.055] bg-[#10161b] px-5 py-5 shadow-[0_18px_60px_rgba(0,0,0,.2)] sm:px-6 sm:py-6">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(228,95,58,.18),transparent_34%),radial-gradient(circle_at_88%_0%,rgba(82,130,175,.08),transparent_34%)]" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[.08em] text-(--primary-3)">
                            <Bookmark size={15} />
                            Особисте
                        </div>
                        <h1 className="mt-2 text-[26px] font-medium leading-tight text-white/94 sm:text-[32px]">Закладки</h1>
                        <p className="mt-2 max-w-[620px] text-[13px] leading-5 text-white/38">
                            Швидке приватне місце для аніме, за якими ти хочеш стежити. Звідси їх можна додавати у звичайні списки.
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/[0.055] bg-black/15 px-3.5 py-2.5 text-right">
                        <p className="text-[18px] font-medium text-white/82">{data?.totalCount ?? 0}</p>
                        <p className="text-[10px] uppercase tracking-[.07em] text-white/28">збережено</p>
                    </div>
                </div>
            </section>

            <section className="mt-5">
                {isFetching && !data ? (
                    <div className="grid min-h-[300px] place-items-center rounded-[20px] border border-white/[0.05] bg-[#10161b] text-white/30">
                        <LoaderCircle size={24} className="animate-spin" />
                    </div>
                ) : isError ? (
                    <div className="grid min-h-[260px] place-items-center rounded-[20px] border border-red-400/10 bg-red-500/[0.035] px-6 text-center text-[14px] text-red-200/70">
                        Не вдалося завантажити закладки.
                    </div>
                ) : items.length ? (
                    <>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                            {items.map((bookmark) => (
                                <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                            ))}
                        </div>

                        {data && data.totalPages > 1 && (
                            <div className="mt-5 flex items-center justify-center gap-2">
                                <PageButton disabled={page <= 1 || isFetching} onClick={() => setPage((value) => value - 1)}>
                                    Назад
                                </PageButton>
                                <span className="px-2 text-[12px] text-white/32">
                                    {page} / {data.totalPages}
                                </span>
                                <PageButton disabled={page >= data.totalPages || isFetching} onClick={() => setPage((value) => value + 1)}>
                                    Далі
                                </PageButton>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="grid min-h-[330px] place-items-center rounded-[20px] border border-dashed border-white/[0.055] bg-[#10161b]/70 px-6 text-center">
                        <div className="max-w-[430px]">
                            <Bookmark size={28} className="mx-auto text-white/17" />
                            <h2 className="mt-3 text-[17px] font-medium text-white/58">Поки що порожньо</h2>
                            <p className="mt-1.5 text-[13px] leading-5 text-white/29">
                                Натискай «Стежити» на картці або сторінці аніме — воно одразу з’явиться тут.
                            </p>
                            <Link
                                href="/animes"
                                className="mt-4 inline-flex h-10 items-center rounded-xl bg-(--primary) px-4 text-[13px] font-medium text-white transition hover:bg-(--primary-3)"
                            >
                                Відкрити каталог
                            </Link>
                        </div>
                    </div>
                )}
            </section>
        </PageShell>
    );
}

function PageShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto w-full max-w-[1280px] px-4 pb-[130px] pt-5 sm:px-6 sm:pt-6 md:pb-16 md:pt-[116px] lg:px-8">
            {children}
        </div>
    );
}

function BookmarkCard({ bookmark }: { bookmark: PublicBookmark }) {
    const [removeBookmark, removeState] = useRemovePublicBookmarkMutation();
    const poster = imageSrc(bookmark.anime.poster?.path);
    const alternativeTitle = bookmark.anime.engTitle || bookmark.anime.originalTitle;

    return (
        <article className="group min-w-0">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[15px] border border-white/[0.055] bg-[#13191e] shadow-[0_14px_34px_rgba(0,0,0,.2)]">
                <Link href={`/anime/${bookmark.anime.slug}`} className="absolute inset-0">
                    {poster ? (
                        <Image
                            src={poster}
                            alt={bookmark.anime.title}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 46vw, 220px"
                            className="object-cover transition duration-500 group-hover:scale-[1.035]"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(228,95,58,.24),transparent_40%),linear-gradient(145deg,#1e2730,#0e1418)]" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/75 to-transparent" />
                </Link>
                <button
                    type="button"
                    onClick={() => void removeBookmark(bookmark.anime.id)}
                    disabled={removeState.isLoading}
                    title="Прибрати із закладок"
                    aria-label="Прибрати із закладок"
                    className="absolute right-2 top-2 z-10 grid size-9 cursor-pointer place-items-center rounded-xl border border-white/10 bg-black/50 text-white/70 backdrop-blur-md transition hover:bg-red-500/30 hover:text-red-100 disabled:cursor-wait disabled:opacity-60"
                >
                    {removeState.isLoading ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
                <span className="absolute bottom-2 left-2 rounded-full border border-white/10 bg-black/45 px-2 py-1 text-[10px] text-white/58 backdrop-blur-md">
                    {animeTypeLabels[bookmark.anime.type]}
                </span>
            </div>

            <div className="px-0.5 pt-2.5">
                <Link href={`/anime/${bookmark.anime.slug}`}>
                    <h2 className="truncate text-[14px] font-medium text-white/84 transition hover:text-white sm:text-[15px]">
                        {bookmark.anime.title}
                    </h2>
                </Link>
                {alternativeTitle && <p className="mt-0.5 truncate text-[11px] text-white/27">{alternativeTitle}</p>}
                <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] text-white/27">
                    <span>{animeStatusLabels[bookmark.anime.status]}</span>
                    <span>{formatSavedDate(bookmark.createdAt)}</span>
                </div>
            </div>
        </article>
    );
}

function PageButton({
    disabled,
    onClick,
    children,
}: {
    disabled: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className="h-9 cursor-pointer rounded-xl border border-white/[0.055] bg-white/[0.035] px-4 text-[12px] text-white/52 transition hover:bg-white/[0.065] hover:text-white/74 disabled:cursor-default disabled:opacity-30"
        >
            {children}
        </button>
    );
}

function formatSavedDate(value: string) {
    return new Intl.DateTimeFormat("uk-UA", { day: "2-digit", month: "short" }).format(new Date(value));
}
