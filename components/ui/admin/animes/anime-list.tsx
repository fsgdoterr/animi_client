"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Filter, Plus, Search, X } from "lucide-react";

import ErrorAlert from "@/components/ui/admin/shared/error-alert";
import EntityActions from "@/components/ui/admin/shared/entity-actions";
import { Button } from "@/components/ui/buttons/button";
import { MultiSelect } from "@/components/ui/dropdowns/multi-select";
import { Select } from "@/components/ui/dropdowns/select";
import { Input } from "@/components/ui/inputs/input";
import Pagination from "@/components/ui/pagination/pagination";
import TableLoading from "@/components/ui/tables/table-loading";
import TableNotFound from "@/components/ui/tables/table-not-found";
import TablePoster from "@/components/ui/tables/table-poster";
import { ADMIN_LIST_PAGE_SIZE } from "@/lib/hooks/use-admin-list-controls";
import {
    useDeleteAnimeMutation,
    useGetAnimesQuery,
} from "@/lib/store/animi/anime-endpoints";
import { useGetGenresQuery } from "@/lib/store/animi/genre-endpoints";
import {
    AnimeStatus,
    AnimeType,
    type AnimeListItem,
    type AnimeSortMode,
} from "@/lib/types/entites/anime";
import { formatDate } from "@/lib/utils/format-date";
import cn from "@/lib/utils/cn";
import {
    animeSortOptions,
    animeStatusFilterOptions,
    animeStatusLabel,
    animeTypeFilterOptions,
    animeTypeLabel,
} from "./anime-options";

export default function AnimeList() {
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search.trim());
    const [sort, setSort] = useState<AnimeSortMode>("new");
    const [page, setPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [genres, setGenres] = useState<string[]>([]);
    const [statuses, setStatuses] = useState<AnimeStatus[]>([]);
    const [types, setTypes] = useState<AnimeType[]>([]);

    const [deleteAnime, deleteState] = useDeleteAnimeMutation();
    const { data: genreData } = useGetGenresQuery({ page: 1, limit: 100 });
    const { data, isLoading, isFetching, error } = useGetAnimesQuery({
        search: deferredSearch || undefined,
        genres: genres.length ? genres.join(",") : undefined,
        status: statuses.length ? statuses.join(",") : undefined,
        type: types.length ? types.join(",") : undefined,
        sort,
        page,
        limit: ADMIN_LIST_PAGE_SIZE,
    });

    useEffect(() => {
        setPage(1);
    }, [deferredSearch, genres, statuses, types, sort]);

    useEffect(() => {
        if (data?.totalPages && page > data.totalPages) {
            setPage(data.totalPages);
        }
    }, [data?.totalPages, page]);

    const genreOptions = useMemo(
        () =>
            genreData?.items.map((genre) => ({
                value: genre.title,
                label: genre.title,
            })) ?? [],
        [genreData?.items],
    );

    const activeFilterCount = genres.length + statuses.length + types.length;

    async function handleDelete(anime: AnimeListItem) {
        if (
            !window.confirm(
                `Видалити аніме «${anime.title}»? Серії, варіанти та повʼязані дані також можуть бути видалені.`,
            )
        ) {
            return;
        }

        try {
            await deleteAnime(anime.id).unwrap();
        } catch {
            // The mutation error is rendered on the page.
        }
    }

    function clearFilters() {
        setGenres([]);
        setStatuses([]);
        setTypes([]);
    }

    const showLoading = isLoading || (isFetching && data === undefined);
    const animes = data?.items ?? [];

    return (
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
            <header className="flex shrink-0 flex-col gap-3 px-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 lg:min-h-[45px]">
                <div className="flex min-w-0 items-baseline gap-3">
                    <h1 className="truncate text-[24px] leading-tight text-white/92 sm:text-[26px] sm:leading-none">
                        Аніме
                    </h1>
                    {data?.totalCount !== undefined && (
                        <span className="hidden shrink-0 text-[14px] text-white/35 sm:inline">
                            {data.totalCount} усього
                        </span>
                    )}
                </div>
                <Button href="/admin/animes/create" color="green" className="w-full sm:w-auto">
                    <Plus size={17} strokeWidth={2} />
                    Додати аніме
                </Button>
            </header>

            <div className="mt-3 grid shrink-0 gap-2 lg:grid-cols-[minmax(0,1fr)_260px_auto]">
                <Input
                    icon={<Search size={19} strokeWidth={1.8} />}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Пошук за назвою"
                />
                <Select
                    label="Сортування"
                    value={sort}
                    options={animeSortOptions}
                    onChange={setSort}
                    className="w-full"
                />
                <Button
                    type="button"
                    color="primary"
                    onClick={() => setFiltersOpen((value) => !value)}
                    className="w-full lg:w-auto"
                >
                    <Filter size={17} strokeWidth={2} />
                    {filtersOpen ? "Сховати фільтри" : "Показати фільтри"}
                    {activeFilterCount > 0 && (
                        <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[12px]">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </div>

            {filtersOpen && (
                <section className="mt-2 shrink-0 rounded-xl border border-white/[0.025] bg-[#11171c] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
                    <div className="grid gap-2 md:grid-cols-3">
                        <MultiSelect
                            label="Жанри"
                            placeholder="Усі жанри"
                            value={genres}
                            options={genreOptions}
                            onChange={setGenres}
                            className="w-full"
                            dropdownClassName="max-h-72 overflow-y-auto"
                        />
                        <MultiSelect
                            label="Статус"
                            placeholder="Усі статуси"
                            value={statuses}
                            options={animeStatusFilterOptions}
                            onChange={setStatuses}
                            className="w-full"
                        />
                        <MultiSelect
                            label="Тип"
                            placeholder="Усі типи"
                            value={types}
                            options={animeTypeFilterOptions}
                            onChange={setTypes}
                            className="w-full"
                        />
                    </div>
                    {activeFilterCount > 0 && (
                        <div className="mt-3 flex justify-end border-t border-white/[0.05] pt-3">
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-white/45 transition hover:bg-white/[0.05] hover:text-white/75"
                            >
                                <X size={15} />
                                Очистити фільтри
                            </button>
                        </div>
                    )}
                </section>
            )}

            <ErrorAlert error={error ?? deleteState.error} />

            <section className="mt-3 flex min-h-[260px] flex-1 flex-col overflow-hidden rounded-xl border border-white/[0.025] bg-[#11171c] shadow-[0_18px_60px_rgba(0,0,0,0.12)] sm:min-h-[320px]">
                <div className="min-h-0 flex-1 overflow-y-auto">
                    {showLoading ? (
                        <TableLoading title="Завантаження аніме..." />
                    ) : animes.length === 0 ? (
                        <TableNotFound
                            title="Аніме не знайдено"
                            subtitle="Змініть фільтри або створіть нове аніме."
                        />
                    ) : (
                        <>
                            <div className="hidden min-h-0 min-w-0 overflow-x-auto p-3 md:block lg:p-4">
                                <AnimeTable
                                    animes={animes}
                                    onDelete={handleDelete}
                                    deleteDisabled={deleteState.isLoading}
                                />
                            </div>
                            <div className="grid gap-2 p-3 md:hidden">
                                <AnimeCards
                                    animes={animes}
                                    onDelete={handleDelete}
                                    deleteDisabled={deleteState.isLoading}
                                />
                            </div>
                        </>
                    )}
                </div>

                <Pagination
                    page={page}
                    totalPages={Math.max(data?.totalPages ?? 1, 1)}
                    totalCount={data?.totalCount ?? 0}
                    isLoading={isFetching}
                    onPageChange={setPage}
                />
            </section>
        </div>
    );
}

function AnimeTable({
    animes,
    onDelete,
    deleteDisabled,
}: {
    animes: AnimeListItem[];
    onDelete: (anime: AnimeListItem) => void;
    deleteDisabled: boolean;
}) {
    return (
        <div className="w-full min-w-[984px]">
            <div className="grid grid-cols-[minmax(230px,1.55fr)_minmax(140px,.9fr)_112px_112px_100px_60px_60px_78px_80px] items-center rounded-md bg-[#939799] px-3 py-2.5 text-[13px] text-white/90 shadow-sm">
                <span>Назва</span>
                <span>Жанри</span>
                <span>Створено</span>
                <span>Змінено</span>
                <span>Статус</span>
                <span>Серії</span>
                <span>Оцінка</span>
                <span>Перегляди</span>
                <span className="text-right">Дії</span>
            </div>
            {animes.map((anime) => (
                <div
                    key={anime.id}
                    className="grid grid-cols-[minmax(230px,1.55fr)_minmax(140px,.9fr)_112px_112px_100px_60px_60px_78px_80px] items-center border-b border-white/[0.10] px-3 py-2.5 text-[13px] text-white/70 last:border-b-0 hover:bg-white/[0.018]"
                >
                    <AnimeIdentity anime={anime} />
                    <p className="line-clamp-2 pr-4 text-white/48">
                        {anime.genres.length
                            ? anime.genres.map((genre) => genre.title).join(", ")
                            : "—"}
                    </p>
                    <span className="whitespace-nowrap text-white/48">{formatDate(anime.createdAt)}</span>
                    <span className="whitespace-nowrap text-white/48">{formatDate(anime.updatedAt)}</span>
                    <StatusBadge status={anime.status} />
                    <span>{anime._count?.episodes ?? 0}</span>
                    <span className="text-(--yellow)">
                        {anime.averageReviewRating == null
                            ? "—"
                            : anime.averageReviewRating.toFixed(1)}
                    </span>
                    <span>{formatCompactNumber(anime._count?.views ?? 0)}</span>
                    <EntityActions
                        editHref={`/admin/animes/${anime.id}`}
                        editLabel={`Редагувати ${anime.title}`}
                        deleteLabel={`Видалити ${anime.title}`}
                        onDelete={() => onDelete(anime)}
                        deleteDisabled={deleteDisabled}
                    />
                </div>
            ))}
        </div>
    );
}

function AnimeCards({
    animes,
    onDelete,
    deleteDisabled,
}: {
    animes: AnimeListItem[];
    onDelete: (anime: AnimeListItem) => void;
    deleteDisabled: boolean;
}) {
    return animes.map((anime) => (
        <article
            key={anime.id}
            className="rounded-lg border border-white/[0.06] bg-white/[0.018] p-3.5"
        >
            <div className="flex min-w-0 items-start gap-3">
                <TablePoster poster={anime.poster} title={anime.title} />
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h2 className="line-clamp-2 text-[16px] text-white/90">
                                {anime.title}
                            </h2>
                            <p className="mt-0.5 truncate text-[12px] text-white/35">
                                {anime.originalTitle || anime.engTitle || anime.slug}
                            </p>
                        </div>
                        <StatusBadge status={anime.status} />
                    </div>
                    <p className="mt-2 line-clamp-1 text-[12px] text-white/42">
                        {anime.genres.length
                            ? anime.genres.map((genre) => genre.title).join(", ")
                            : animeTypeLabel(anime.type)}
                    </p>
                </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/[0.05] pt-3 text-[12px]">
                <MiniStat label="Серії" value={String(anime._count?.episodes ?? 0)} />
                <MiniStat
                    label="Оцінка"
                    value={
                        anime.averageReviewRating == null
                            ? "—"
                            : anime.averageReviewRating.toFixed(1)
                    }
                />
                <MiniStat
                    label="Перегляди"
                    value={formatCompactNumber(anime._count?.views ?? 0)}
                />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.05] pt-3">
                <p className="min-w-0 truncate text-[12px] text-white/34">
                    #{anime.id} · {formatDate(anime.updatedAt)}
                </p>
                <EntityActions
                    editHref={`/admin/animes/${anime.id}`}
                    editLabel={`Редагувати ${anime.title}`}
                    deleteLabel={`Видалити ${anime.title}`}
                    onDelete={() => onDelete(anime)}
                    deleteDisabled={deleteDisabled}
                />
            </div>
        </article>
    ));
}

function AnimeIdentity({ anime }: { anime: AnimeListItem }) {
    return (
        <div className="flex min-w-0 items-center gap-3 pr-4">
            <TablePoster poster={anime.poster} title={anime.title} />
            <div className="min-w-0">
                <p className="line-clamp-2 text-[14px] leading-4 text-white/90">
                    {anime.title}
                </p>
                <p className="mt-1 truncate text-[11px] text-white/32">
                    {anime.originalTitle || anime.engTitle || animeTypeLabel(anime.type)}
                </p>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: AnimeStatus }) {
    const className = cn(
        "inline-flex w-fit rounded-md border px-2 py-1 text-[11px] leading-none",
        status === AnimeStatus.DRAFT && "border-white/15 bg-white/[0.05] text-white/60",
        status === AnimeStatus.ONGOING && "border-green-400/20 bg-green-400/[0.08] text-green-300/85",
        status === AnimeStatus.ANNOUNCED && "border-blue-400/20 bg-blue-400/[0.08] text-blue-300/85",
        status === AnimeStatus.COMPLETED && "border-violet-400/20 bg-violet-400/[0.08] text-violet-300/85",
        status === AnimeStatus.CANCELED && "border-red-400/20 bg-red-400/[0.08] text-red-300/85",
    );

    return <span className={className}>{animeStatusLabel(status)}</span>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0">
            <p className="text-white/30">{label}</p>
            <p className="mt-0.5 truncate text-white/70">{value}</p>
        </div>
    );
}

function formatCompactNumber(value: number) {
    return new Intl.NumberFormat("uk-UA", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
}
