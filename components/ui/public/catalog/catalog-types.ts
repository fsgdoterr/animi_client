import type { MultiSelectFilterValue } from "@/components/ui/dropdowns/multi-select";
import {
    AnimeRating,
    AnimeStatus,
    AnimeType,
    DubType,
} from "@/lib/types/entites/anime";

export type CatalogViewMode = "list" | "grid";
export type ReleaseFilterMode = "single" | "range";

export interface CatalogFilters {
    genres: MultiSelectFilterValue<string>;
    statuses: AnimeStatus[];
    types: AnimeType[];
    ratings: AnimeRating[];
    countries: string[];
    studios: string[];
    producers: string[];
    dubTeams: string[];
    dubTypes: DubType[];
    releaseMode: ReleaseFilterMode;
    releaseFrom: string;
    releaseTo: string;
}

export function createCatalogFilters(initialStatus?: string): CatalogFilters {
    const status = Object.values(AnimeStatus).includes(initialStatus as AnimeStatus)
        && initialStatus !== AnimeStatus.DRAFT
        ? (initialStatus as AnimeStatus)
        : null;

    return {
        genres: { include: [], exclude: [] },
        statuses: status ? [status] : [],
        types: [],
        ratings: [],
        countries: [],
        studios: [],
        producers: [],
        dubTeams: [],
        dubTypes: [DubType.DUB, DubType.SUB],
        releaseMode: "single",
        releaseFrom: "",
        releaseTo: "",
    };
}

function sameValues<T extends string>(left: T[], right: T[]) {
    if (left.length !== right.length) return false;

    const rightValues = new Set(right);
    return left.every((value) => rightValues.has(value));
}

export function catalogFiltersEqual(
    left: CatalogFilters,
    right: CatalogFilters,
) {
    return (
        sameValues(left.genres.include, right.genres.include)
        && sameValues(left.genres.exclude, right.genres.exclude)
        && sameValues(left.statuses, right.statuses)
        && sameValues(left.types, right.types)
        && sameValues(left.ratings, right.ratings)
        && sameValues(left.countries, right.countries)
        && sameValues(left.studios, right.studios)
        && sameValues(left.producers, right.producers)
        && sameValues(left.dubTeams, right.dubTeams)
        && sameValues(left.dubTypes, right.dubTypes)
        && left.releaseMode === right.releaseMode
        && left.releaseFrom === right.releaseFrom
        && left.releaseTo === right.releaseTo
    );
}

export function appliedCatalogFilterCount(
    filters: CatalogFilters,
    defaults: CatalogFilters,
) {
    let count = 0;

    if (
        !sameValues(filters.genres.include, defaults.genres.include)
        || !sameValues(filters.genres.exclude, defaults.genres.exclude)
    ) {
        count += 1;
    }

    if (!sameValues(filters.statuses, defaults.statuses)) count += 1;
    if (!sameValues(filters.types, defaults.types)) count += 1;
    if (!sameValues(filters.ratings, defaults.ratings)) count += 1;
    if (!sameValues(filters.countries, defaults.countries)) count += 1;
    if (!sameValues(filters.studios, defaults.studios)) count += 1;
    if (!sameValues(filters.producers, defaults.producers)) count += 1;
    if (!sameValues(filters.dubTeams, defaults.dubTeams)) count += 1;

    const dubTypeFilter = filters.dubTypes.length === 1
        ? filters.dubTypes[0]
        : null;
    const defaultDubTypeFilter = defaults.dubTypes.length === 1
        ? defaults.dubTypes[0]
        : null;

    if (dubTypeFilter !== defaultDubTypeFilter) count += 1;

    if (
        filters.releaseFrom !== defaults.releaseFrom
        || filters.releaseTo !== defaults.releaseTo
    ) {
        count += 1;
    }

    return count;
}
