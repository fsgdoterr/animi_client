"use client";

import {
    ChevronDown,
    LoaderCircle,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/buttons/button";
import { Select, type SelectOption } from "@/components/ui/dropdowns/select";
import Pagination from "@/components/ui/pagination/pagination";
import CatalogAnimeCard from "@/components/ui/public/catalog/catalog-anime-card";
import CatalogFilterBar from "@/components/ui/public/catalog/catalog-filter-bar";
import CatalogViewToggle from "@/components/ui/public/catalog/catalog-view-toggle";
import {
    appliedCatalogFilterCount,
    catalogFiltersEqual,
    createCatalogFilters,
    type CatalogFilters,
    type CatalogViewMode,
} from "@/components/ui/public/catalog/catalog-types";
import {
    buildCatalogQuery,
    parseCatalogQuery,
    type CatalogPreset,
    type CatalogQueryState,
} from "@/components/ui/public/catalog/catalog-query";
import { getReleaseQueryRange } from "@/components/ui/public/catalog/release-period";
import AnimeCard from "@/components/ui/public/home/anime-card";
import {
    type PublicAnimeSort,
    useGetPublicAnimeMetaQuery,
    useGetPublicAnimesQuery,
} from "@/lib/store/animi/public-endpoints";
import { AnimeStatus } from "@/lib/types/entites/anime";
import cn from "@/lib/utils/cn";

const sortOptions: SelectOption<PublicAnimeSort>[] = [
    { value: "views", label: "Найбільше переглядів" },
    { value: "new", label: "Найновіші" },
    { value: "release", label: "За датою релізу" },
    { value: "title", label: "За назвою" },
    { value: "old", label: "Найстаріші" },
];

function csv(values: string[]) {
    return values.length ? JSON.stringify(values) : undefined;
}


export default function PublicAnimeCatalog({
    initialQueryString,
}: {
    initialQueryString: string;
}) {
    const [initialQuery] = useState(() => parseCatalogQuery(initialQueryString));
    const [preset, setPreset] = useState<CatalogPreset>(initialQuery.preset);
    const [page, setPage] = useState(initialQuery.page);
    const [search, setSearch] = useState(initialQuery.search);
    const [appliedSearch, setAppliedSearch] = useState(initialQuery.search);
    const [sort, setSort] = useState<PublicAnimeSort>(initialQuery.sort);
    const [viewMode, setViewMode] = useState<CatalogViewMode>(initialQuery.viewMode);
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [filters, setFilters] = useState<CatalogFilters>(initialQuery.filters);
    const [appliedFilters, setAppliedFilters] = useState<CatalogFilters>(
        initialQuery.filters,
    );

    useEffect(() => {
        const next = parseCatalogQuery(initialQueryString);

        setPreset(next.preset);
        setPage(next.page);
        setSearch(next.search);
        setAppliedSearch(next.search);
        setSort(next.sort);
        setViewMode(next.viewMode);
        setFilters(next.filters);
        setAppliedFilters(next.filters);
        setMobileFiltersOpen(false);
    }, [initialQueryString]);

    useEffect(() => {
        if (!mobileFiltersOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [mobileFiltersOpen]);

    const {
        data: meta,
        isLoading: metaLoading,
        isError: metaError,
        refetch: refetchMeta,
    } = useGetPublicAnimeMetaQuery();
    const pageLimit = viewMode === "list" ? 16 : 24;
    const releaseRange = getReleaseQueryRange({
        mode: appliedFilters.releaseMode,
        from: appliedFilters.releaseFrom,
        to: appliedFilters.releaseTo,
        years: meta?.releaseYears ?? [],
    });
    const { data, isLoading, isFetching } = useGetPublicAnimesQuery({
        page,
        limit: pageLimit,
        search: appliedSearch || undefined,
        sort,
        status: csv(appliedFilters.statuses),
        type: csv(appliedFilters.types),
        genres: csv(appliedFilters.genres.include),
        excludeGenres: csv(appliedFilters.genres.exclude),
        ratings: csv(appliedFilters.ratings),
        countries: csv(appliedFilters.countries),
        studios: csv(appliedFilters.studios),
        producers: csv(appliedFilters.producers),
        dubTeams: csv(appliedFilters.dubTeams),
        dubTypes:
            appliedFilters.dubTypes.length === 1
                ? csv(appliedFilters.dubTypes)
                : undefined,
        releaseFrom: releaseRange.releaseFrom,
        releaseTo: releaseRange.releaseTo,
    });

    const isOngoing =
        appliedFilters.statuses.length === 1
        && appliedFilters.statuses[0] === AnimeStatus.ONGOING;
    const title = isOngoing ? "Онгоїнги" : "Усі аніме";
    const defaultFilters = createCatalogFilters(
        preset === "ongoing" ? AnimeStatus.ONGOING : undefined,
    );
    const appliedFilterCount = appliedCatalogFilterCount(
        appliedFilters,
        defaultFilters,
    );
    const resetDisabled =
        catalogFiltersEqual(filters, defaultFilters)
        && catalogFiltersEqual(appliedFilters, defaultFilters);

    function replaceCatalogUrl(overrides: Partial<CatalogQueryState>) {
        const query = buildCatalogQuery({
            preset,
            page,
            search: appliedSearch,
            sort,
            viewMode,
            filters: appliedFilters,
            ...overrides,
        });
        const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;

        window.history.replaceState(window.history.state, "", nextUrl);
    }

    function applySearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const nextSearch = search.trim();

        setPage(1);
        setAppliedSearch(nextSearch);
        replaceCatalogUrl({ page: 1, search: nextSearch });
    }

    function applyFilters() {
        setAppliedFilters(filters);
        setPage(1);
        replaceCatalogUrl({ page: 1, filters });
    }

    function applyMobileFilters() {
        applyFilters();
        setMobileFiltersOpen(false);
    }

    function resetFilters() {
        const next = createCatalogFilters(
            preset === "ongoing" ? AnimeStatus.ONGOING : undefined,
        );
        setFilters(next);
        setAppliedFilters(next);
        setPage(1);
        replaceCatalogUrl({ page: 1, filters: next });
    }

    function changeViewMode(mode: CatalogViewMode) {
        setViewMode(mode);
        setPage(1);
        replaceCatalogUrl({ page: 1, viewMode: mode });
    }

    return (
        <section className="relative min-h-[calc(100dvh-160px)] overflow-hidden bg-[#080c0f]">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[linear-gradient(180deg,rgba(82,63,181,.22)_0%,rgba(48,80,166,.14)_34%,rgba(24,49,91,.07)_62%,rgba(8,12,15,0)_100%)]"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[min(1050px,92vw)] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(111,91,226,.10),rgba(8,12,15,0)_68%)] blur-3xl"
            />

            <div className="relative z-10 mx-auto w-full max-w-[1320px] px-4 pb-40 pt-8 sm:px-6 sm:pt-10 md:pb-20 md:pt-[136px] lg:px-8 lg:pt-36">
                <div>
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h1 className="text-[30px] font-semibold tracking-tight text-white/94 sm:text-[36px]">
                                {title}
                            </h1>
                            <p className="mt-1 text-[13px] text-white/34">
                                Знайдіть аніме за жанром, роком, студією, озвученням та іншими параметрами.
                            </p>
                        </div>
                        {data && (
                            <span className="text-[12px] text-white/28">
                                Знайдено: {data.totalCount}
                            </span>
                        )}
                    </div>
                </div>

                <div className="relative z-50 mt-6 grid grid-cols-[minmax(0,1fr)_auto] gap-2.5 md:grid-cols-[minmax(0,1fr)_310px_auto]">
                    <form onSubmit={applySearch} className="relative col-span-2 min-w-0 md:col-span-1">
                        <Search
                            size={19}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/38"
                        />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Пошук"
                            className="h-11 w-full rounded-xl border border-white/[0.055] bg-[#11171c]/92 pl-11 pr-4 text-[14px] text-white/85 outline-none transition placeholder:text-white/28 focus:border-violet-300/20 focus:bg-[#141b21]"
                        />
                        <button type="submit" className="sr-only">
                            Шукати
                        </button>
                    </form>

                    <Select
                        label="Сортування"
                        value={sort}
                        options={sortOptions}
                        className="w-full"
                        onChange={(value) => {
                            setSort(value);
                            setPage(1);
                            replaceCatalogUrl({ page: 1, sort: value });
                        }}
                    />

                    <CatalogViewToggle
                        value={viewMode}
                        onChange={changeViewMode}
                        className="md:hidden"
                    />

                    <Button
                        type="button"
                        onClick={() => setFiltersOpen((value) => !value)}
                        className="hidden h-11 rounded-xl px-4 md:inline-flex"
                    >
                        <SlidersHorizontal size={17} />
                        {filtersOpen ? "Сховати фільтри" : "Показати фільтри"}
                        {appliedFilterCount > 0 && (
                            <span className="grid min-w-5 place-items-center rounded-full border border-white/15 bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold leading-4 text-white/90">
                                {appliedFilterCount}
                            </span>
                        )}
                        <ChevronDown
                            size={16}
                            className={cn("transition-transform", filtersOpen && "rotate-180")}
                        />
                    </Button>
                </div>

                {filtersOpen && (
                    <div className="hidden md:block">
                        <CatalogFilterBar
                            filters={filters}
                            meta={meta}
                            metaLoading={metaLoading}
                            metaError={metaError}
                            onRetryMeta={() => void refetchMeta()}
                            onChange={setFilters}
                            onApply={applyFilters}
                            onReset={resetFilters}
                            viewMode={viewMode}
                            onViewModeChange={changeViewMode}
                            isApplying={isFetching}
                            resetDisabled={resetDisabled}
                            hideStatus={preset === "ongoing"}
                        />
                    </div>
                )}

                <div className="relative z-10 mt-5 min-h-[430px]">
                    {isFetching && !isLoading && (
                        <div className="pointer-events-none absolute right-2 top-[-36px] z-20 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-[#11171c]/90 px-3 py-1.5 text-[11px] text-white/45 shadow-lg backdrop-blur-md">
                            <LoaderCircle size={13} className="animate-spin" />
                            Оновлюємо список
                        </div>
                    )}

                    {isLoading ? (
                        <CatalogSkeleton mode={viewMode} />
                    ) : data?.items.length ? (
                        <>
                            {viewMode === "list" ? (
                                <div className="grid gap-3 lg:grid-cols-2">
                                    {data.items.map((anime) => (
                                        <CatalogAnimeCard key={anime.id} anime={anime} />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-x-3 gap-y-7 min-[520px]:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                    {data.items.map((anime) => (
                                        <AnimeCard key={anime.id} anime={anime} />
                                    ))}
                                </div>
                            )}

                            {data.totalPages > 1 && (
                                <div className="mt-8 overflow-hidden rounded-2xl border border-white/[0.05] bg-[#0d1318]/65">
                                    <Pagination
                                        page={page}
                                        totalPages={data.totalPages}
                                        totalCount={data.totalCount}
                                        isLoading={isFetching}
                                        onPageChange={(nextPage) => {
                                            setPage(nextPage);
                                            replaceCatalogUrl({ page: nextPage });
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex min-h-[430px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.07] bg-[#0d1318]/45 px-6 text-center">
                            <Search size={26} className="mb-3 text-white/16" />
                            <p className="text-[15px] text-white/58">Аніме не знайдено</p>
                            <p className="mt-1 max-w-sm text-[13px] leading-5 text-white/28">
                                Спробуйте змінити пошуковий запит або скинути частину фільтрів.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="catalog-mobile-filter-trigger fixed inset-x-3 bottom-[calc(86px+env(safe-area-inset-bottom))] z-[90] md:hidden">
                <button
                    type="button"
                    aria-expanded={mobileFiltersOpen}
                    onClick={() => setMobileFiltersOpen((value) => !value)}
                    className={cn(
                        "mx-auto flex h-12 w-full max-w-[560px] items-center justify-center gap-2 rounded-2xl border px-4 text-[14px] font-medium shadow-[0_14px_45px_rgba(0,0,0,.42)] backdrop-blur-xl transition active:scale-[0.99]",
                        mobileFiltersOpen
                            ? "text-(--primary) [border-color:color-mix(in_srgb,var(--primary)_34%,transparent)] [background-color:color-mix(in_srgb,var(--primary)_12%,#151c22)]"
                            : "border-white/[0.08] bg-[#151c22]/96 text-white/82",
                    )}
                >
                    {mobileFiltersOpen ? <X size={17} /> : <SlidersHorizontal size={17} />}
                    {mobileFiltersOpen ? "Закрити фільтри" : "Фільтри"}
                    {appliedFilterCount > 0 && (
                        <span
                            className={cn(
                                "grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-4",
                                mobileFiltersOpen
                                    ? "[background-color:color-mix(in_srgb,var(--primary)_18%,transparent)] text-(--primary)"
                                    : "bg-(--primary) text-white",
                            )}
                        >
                            {appliedFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {mobileFiltersOpen && (
                <>
                    <button
                        type="button"
                        aria-label="Закрити фільтри"
                        onClick={() => setMobileFiltersOpen(false)}
                        className="fixed inset-x-0 top-0 bottom-[calc(86px+env(safe-area-inset-bottom))] z-[71] bg-black/55 backdrop-blur-[2px] md:hidden"
                    />
                    <div className="fixed inset-x-2 bottom-[calc(142px+env(safe-area-inset-bottom))] z-[75] md:hidden">
                        <div className="mx-auto max-h-[calc(100dvh-158px-env(safe-area-inset-bottom))] w-full max-w-[560px] overflow-y-auto overscroll-contain rounded-[24px] border border-white/[0.08] bg-[#10161b]/98 p-3 shadow-[0_28px_80px_rgba(0,0,0,.58)] backdrop-blur-2xl">
                            <div className="sticky top-0 z-[110] mb-2 flex items-center justify-between rounded-xl bg-[#10161b]/96 px-1 pb-2 pt-1 backdrop-blur-xl">
                                <div>
                                    <p className="text-[15px] font-medium text-white/90">Фільтри</p>
                                    <p className="mt-0.5 text-[11px] text-white/34">Налаштуйте каталог під себе</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="grid size-9 place-items-center rounded-xl bg-white/[0.045] text-white/55 transition active:scale-95"
                                    aria-label="Закрити фільтри"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="mb-3 grid grid-cols-1 gap-2.5">
                                <form onSubmit={applySearch} className="relative min-w-0">
                                    <Search
                                        size={18}
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/38"
                                    />
                                    <input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Пошук"
                                        className="h-11 w-full rounded-xl border border-white/[0.055] bg-[#171d22] pl-11 pr-4 text-[14px] text-white/85 outline-none transition placeholder:text-white/28 focus:border-violet-300/20 focus:bg-[#1a2026]"
                                    />
                                    <button type="submit" className="sr-only">
                                        Шукати
                                    </button>
                                </form>

                                <Select
                                    label="Сортування"
                                    value={sort}
                                    options={sortOptions}
                                    className="z-[90] w-full"
                                    onChange={(value) => {
                                        setSort(value);
                                        setPage(1);
                                        replaceCatalogUrl({ page: 1, sort: value });
                                    }}
                                />
                            </div>

                            <CatalogFilterBar
                                filters={filters}
                                meta={meta}
                                metaLoading={metaLoading}
                                metaError={metaError}
                                onRetryMeta={() => void refetchMeta()}
                                onChange={setFilters}
                                onApply={applyMobileFilters}
                                onReset={resetFilters}
                                viewMode={viewMode}
                                onViewModeChange={changeViewMode}
                                isApplying={isFetching}
                                resetDisabled={resetDisabled}
                                hideStatus={preset === "ongoing"}
                                className="z-[76] mt-0 border-0 bg-transparent p-0 shadow-none backdrop-blur-none sm:p-0"
                            />
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}

function CatalogSkeleton({ mode }: { mode: CatalogViewMode }) {
    if (mode === "grid") {
        return (
            <div className="grid grid-cols-2 gap-x-3 gap-y-7 min-[520px]:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                        <div className="aspect-[3/4] rounded-xl bg-white/[0.045]" />
                        <div className="mt-3 h-4 w-4/5 rounded bg-white/[0.045]" />
                        <div className="mt-2 h-3 w-3/5 rounded bg-white/[0.03]" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-3 lg:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
                <div
                    key={index}
                    className="grid animate-pulse grid-cols-[104px_minmax(0,1fr)] gap-3 rounded-2xl border border-white/[0.04] bg-[#0d1318]/60 p-2.5 sm:grid-cols-[132px_minmax(0,1fr)] sm:gap-4 sm:p-3"
                >
                    <div className="aspect-[3/4] rounded-xl bg-white/[0.045]" />
                    <div className="py-1">
                        <div className="h-4 w-3/4 rounded bg-white/[0.05]" />
                        <div className="mt-2 h-3 w-1/2 rounded bg-white/[0.035]" />
                        <div className="mt-4 h-3 w-2/3 rounded bg-white/[0.035]" />
                        <div className="mt-3 h-3 w-full rounded bg-white/[0.03]" />
                        <div className="mt-2 h-3 w-5/6 rounded bg-white/[0.03]" />
                    </div>
                </div>
            ))}
        </div>
    );
}
