"use client";

import { LoaderCircle, Search } from "lucide-react";
import { useState } from "react";

import AnimeCard from "@/components/ui/public/home/anime-card";
import { useGetPublicAnimesQuery } from "@/lib/store/animi/public-endpoints";

export default function PublicAnimeCatalog({
    initialStatus,
    initialSearch = "",
}: {
    initialStatus?: string;
    initialSearch?: string;
}) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState(initialSearch);
    const [appliedSearch, setAppliedSearch] = useState(initialSearch);
    const { data, isLoading, isFetching } = useGetPublicAnimesQuery({
        page,
        limit: 24,
        status: initialStatus,
        search: appliedSearch || undefined,
        sort: "new",
    });

    const title = initialStatus === "ONGOING" ? "Онгоїнги" : appliedSearch ? `Пошук: ${appliedSearch}` : "Усі аніме";

    return (
        <div className="mx-auto min-h-[calc(100dvh-160px)] w-full max-w-[1480px] px-4 pb-20 pt-36 sm:px-6 sm:pt-32 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[13px] uppercase tracking-[0.18em] text-(--primary-3)">Каталог</p>
                    <h1 className="mt-1 text-[30px] font-semibold tracking-tight text-white/92 sm:text-[38px]">{title}</h1>
                </div>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        setPage(1);
                        setAppliedSearch(search.trim());
                    }}
                    className="flex h-11 w-full items-center gap-2 rounded-xl border border-white/[0.055] bg-[#11171c] px-3 sm:max-w-sm"
                >
                    <Search size={18} className="text-white/35" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Пошук у каталозі"
                        className="min-w-0 flex-1 bg-transparent text-sm text-white/80 outline-none placeholder:text-white/28"
                    />
                </form>
            </div>

            {isLoading ? (
                <div className="flex min-h-[420px] items-center justify-center text-white/35">
                    <LoaderCircle size={20} className="mr-2 animate-spin" /> Завантаження...
                </div>
            ) : data?.items.length ? (
                <>
                    <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-7 min-[520px]:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {data.items.map((anime) => <AnimeCard key={anime.id} anime={anime} />)}
                    </div>
                    <div className="mt-10 flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => setPage((value) => Math.max(1, value - 1))}
                            disabled={page <= 1 || isFetching}
                            className="h-10 cursor-pointer rounded-xl border border-white/[0.06] bg-white/[0.035] px-4 text-sm text-white/55 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            Назад
                        </button>
                        <span className="text-sm text-white/35">{page} / {Math.max(data.totalPages, 1)}</span>
                        <button
                            type="button"
                            onClick={() => setPage((value) => Math.min(data.totalPages, value + 1))}
                            disabled={page >= data.totalPages || isFetching}
                            className="h-10 cursor-pointer rounded-xl border border-white/[0.06] bg-white/[0.035] px-4 text-sm text-white/55 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            Далі
                        </button>
                    </div>
                </>
            ) : (
                <div className="mt-8 flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.07] bg-white/[0.015] text-center">
                    <p className="text-white/55">Аніме не знайдено</p>
                    <p className="mt-1 text-sm text-white/25">Спробуйте інший пошуковий запит.</p>
                </div>
            )}
        </div>
    );
}
