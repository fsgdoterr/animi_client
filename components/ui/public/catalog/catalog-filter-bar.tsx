"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/buttons/button";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/dropdowns/multi-select";
import type { CatalogFilters, CatalogViewMode } from "@/components/ui/public/catalog/catalog-types";
import CatalogViewToggle from "@/components/ui/public/catalog/catalog-view-toggle";
import ReleaseRangeSelect from "@/components/ui/public/catalog/release-range-select";
import {
    AnimeRating,
    AnimeStatus,
    AnimeType,
    DubType,
} from "@/lib/types/entites/anime";
import type { PublicAnimeMeta } from "@/lib/types/public";
import {
    animeRatingLabels,
    animeStatusLabels,
    animeTypeLabels,
} from "@/lib/utils/public-anime";
import cn from "@/lib/utils/cn";

const typeOptions: MultiSelectOption<AnimeType>[] = Object.values(AnimeType).map((value) => ({
    value,
    label: animeTypeLabels[value],
}));

const ratingOptions: MultiSelectOption<AnimeRating>[] = Object.values(AnimeRating).map((value) => ({
    value,
    label: animeRatingLabels[value],
}));

const statusOptions: MultiSelectOption<AnimeStatus>[] = Object.values(AnimeStatus)
    .filter((value) => value !== AnimeStatus.DRAFT)
    .map((value) => ({
        value,
        label: animeStatusLabels[value],
    }));

const dubTypeOptions: MultiSelectOption<DubType>[] = [
    { value: DubType.DUB, label: "Озвучка" },
    { value: DubType.SUB, label: "Субтитри" },
];

function stringOptions(values: string[]): MultiSelectOption<string>[] {
    return values.map((value) => ({ value, label: value }));
}

function entityOptions(values: { id: number; title: string }[]): MultiSelectOption<string>[] {
    return values.map(({ id, title }) => ({ value: String(id), label: title }));
}

export default function CatalogFilterBar({
    filters,
    meta,
    metaLoading,
    metaError,
    onRetryMeta,
    onChange,
    onApply,
    onReset,
    viewMode,
    onViewModeChange,
    isApplying,
    resetDisabled,
    hideStatus = false,
    className,
}: {
    filters: CatalogFilters;
    meta?: PublicAnimeMeta;
    metaLoading: boolean;
    metaError: boolean;
    onRetryMeta: () => void;
    onChange: (filters: CatalogFilters) => void;
    onApply: () => void;
    onReset: () => void;
    viewMode: CatalogViewMode;
    onViewModeChange: (mode: CatalogViewMode) => void;
    isApplying: boolean;
    resetDisabled: boolean;
    hideStatus?: boolean;
    className?: string;
}) {
    const metaPlaceholder = (fallback: string) =>
        metaLoading ? "Завантаження..." : metaError ? "Помилка завантаження" : fallback;

    return (
        <div
            className={cn(
                "relative z-40 mt-3 rounded-2xl border border-white/[0.055] bg-[#10161b]/82 p-3 shadow-[0_18px_50px_rgba(0,0,0,.16)] backdrop-blur-md sm:p-4",
                className,
            )}
        >
            {metaError && (
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.055] px-3 py-2 text-[12px] text-white/55">
                    <span>Не вдалося завантажити списки жанрів, країн, студій та команд.</span>
                    <button
                        type="button"
                        onClick={onRetryMeta}
                        className="font-medium text-red-300/90 transition hover:text-red-200"
                    >
                        Спробувати ще раз
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                <MultiSelect
                    mode="filter"
                    label="Жанри"
                    placeholder={metaPlaceholder("Усі жанри")}
                    value={filters.genres}
                    options={entityOptions(meta?.genres ?? [])}
                    disabled={metaLoading || metaError}
                    onChange={(genres) => onChange({ ...filters, genres })}
                />

                <ReleaseRangeSelect
                    mode={filters.releaseMode}
                    from={filters.releaseFrom}
                    to={filters.releaseTo}
                    years={meta?.releaseYears ?? []}
                    disabled={metaLoading || metaError}
                    onChange={({ mode: releaseMode, from: releaseFrom, to: releaseTo }) =>
                        onChange({ ...filters, releaseMode, releaseFrom, releaseTo })
                    }
                />

                <MultiSelect
                    label="Тип"
                    placeholder="Усі типи"
                    value={filters.types}
                    options={typeOptions}
                    onChange={(types) => onChange({ ...filters, types })}
                />

                <MultiSelect
                    label="Рейтинг"
                    placeholder="Будь-який"
                    value={filters.ratings}
                    options={ratingOptions}
                    onChange={(ratings) => onChange({ ...filters, ratings })}
                />

                {!hideStatus && (
                    <MultiSelect
                        label="Статус"
                        placeholder="Будь-який"
                        value={filters.statuses}
                        options={statusOptions}
                        onChange={(statuses) => onChange({ ...filters, statuses })}
                    />
                )}

                <MultiSelect
                    label="Країна"
                    placeholder={metaPlaceholder("Усі країни")}
                    value={filters.countries}
                    options={stringOptions(meta?.countries ?? [])}
                    disabled={metaLoading || metaError}
                    onChange={(countries) => onChange({ ...filters, countries })}
                />

                <MultiSelect
                    label="Студія"
                    placeholder={metaPlaceholder("Усі студії")}
                    value={filters.studios}
                    options={stringOptions(meta?.studios ?? [])}
                    disabled={metaLoading || metaError}
                    onChange={(studios) => onChange({ ...filters, studios })}
                />

                <MultiSelect
                    label="Продюсери"
                    placeholder={metaPlaceholder("Усі продюсери")}
                    value={filters.producers}
                    options={entityOptions(meta?.producers ?? [])}
                    disabled={metaLoading || metaError}
                    onChange={(producers) => onChange({ ...filters, producers })}
                />

                <MultiSelect
                    label="Команди озвучення"
                    placeholder={metaPlaceholder("Усі команди")}
                    value={filters.dubTeams}
                    options={entityOptions(meta?.dubTeams ?? [])}
                    disabled={metaLoading || metaError}
                    onChange={(dubTeams) => onChange({ ...filters, dubTeams })}
                />

                <MultiSelect
                    label="Переклад"
                    placeholder="Без обмежень"
                    value={filters.dubTypes}
                    options={dubTypeOptions}
                    onChange={(dubTypes) => onChange({ ...filters, dubTypes })}
                />
            </div>

            <div className="mt-3 flex flex-col-reverse gap-2 border-t border-white/[0.05] pt-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    type="button"
                    color="red"
                    variant="soft"
                    className="w-full sm:w-auto"
                    onClick={onReset}
                    disabled={resetDisabled}
                >
                    <RotateCcw size={16} />
                    Скинути фільтри
                </Button>

                <div className="flex items-center gap-2 sm:justify-end">
                    <CatalogViewToggle
                        value={viewMode}
                        onChange={onViewModeChange}
                    />

                    <Button
                        type="button"
                        onClick={onApply}
                        disabled={isApplying}
                        className="min-w-[116px] flex-1 sm:flex-none"
                    >
                        {isApplying ? "Фільтруємо..." : "Фільтрувати"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
