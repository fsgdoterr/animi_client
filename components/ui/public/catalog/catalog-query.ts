import {
    AnimeRating,
    AnimeStatus,
    AnimeType,
    DubType,
} from "@/lib/types/entites/anime";
import type { PublicAnimeSort } from "@/lib/store/animi/public-endpoints";

import {
    createCatalogFilters,
    type CatalogFilters,
    type CatalogViewMode,
} from "./catalog-types";

export type CatalogPreset = "ongoing" | null;

export interface CatalogQueryState {
    preset: CatalogPreset;
    page: number;
    search: string;
    sort: PublicAnimeSort;
    viewMode: CatalogViewMode;
    filters: CatalogFilters;
}

const sortValues: PublicAnimeSort[] = ["popular", "new", "release", "title", "old"];
const viewModes: CatalogViewMode[] = ["list", "grid"];

function parseEnumValues<T extends string>(
    values: string[],
    allowed: readonly T[],
): T[] {
    const allowedValues = new Set<string>(allowed);
    return [...new Set(values.filter((value): value is T => allowedValues.has(value)))];
}

function parseStrings(params: URLSearchParams, key: string) {
    return [...new Set(params.getAll(key).map((value) => value.trim()).filter(Boolean))];
}

function parsePositiveInt(value: string | null, fallback: number) {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function isReleasePeriod(value: string | null): value is string {
    if (!value) return false;
    return /^year:\d{4}$/.test(value)
        || /^season:\d{4}:(winter|spring|summer|autumn)$/.test(value);
}

export function parseCatalogQuery(queryString: string): CatalogQueryState {
    const params = new URLSearchParams(queryString);
    const preset: CatalogPreset = params.get("preset") === "ongoing" ? "ongoing" : null;
    const defaults = createCatalogFilters(
        preset === "ongoing" ? AnimeStatus.ONGOING : undefined,
    );
    const filters: CatalogFilters = {
        ...defaults,
        genres: {
            include: parseStrings(params, "genre"),
            exclude: parseStrings(params, "excludeGenre"),
        },
        types: parseEnumValues(params.getAll("type"), Object.values(AnimeType)),
        ratings: parseEnumValues(params.getAll("rating"), Object.values(AnimeRating)),
        countries: parseStrings(params, "country"),
        studios: parseStrings(params, "studio"),
        producers: parseStrings(params, "producer"),
        dubTeams: parseStrings(params, "dubTeam"),
    };

    if (preset !== "ongoing" && params.has("status")) {
        const statuses = params.getAll("status");
        filters.statuses = statuses.includes("all")
            ? []
            : parseEnumValues(statuses, Object.values(AnimeStatus)).filter(
                (status) => status !== AnimeStatus.DRAFT,
            );
    }

    if (params.has("dubType")) {
        const dubTypes = params.getAll("dubType");
        filters.dubTypes = dubTypes.includes("none")
            ? []
            : parseEnumValues(dubTypes, Object.values(DubType));
    }

    const releaseFrom = params.get("releaseFrom");
    const releaseTo = params.get("releaseTo");
    const releaseMode = params.get("releaseMode");

    filters.releaseMode = releaseMode === "range" ? "range" : "single";
    filters.releaseFrom = isReleasePeriod(releaseFrom) ? releaseFrom : "";
    filters.releaseTo = filters.releaseMode === "range" && isReleasePeriod(releaseTo)
        ? releaseTo
        : "";

    const rawSort = params.get("sort") as PublicAnimeSort | null;
    const rawViewMode = params.get("view") as CatalogViewMode | null;

    return {
        preset,
        page: parsePositiveInt(params.get("page"), 1),
        search: params.get("q")?.trim() ?? "",
        sort: rawSort && sortValues.includes(rawSort) ? rawSort : "popular",
        viewMode: rawViewMode && viewModes.includes(rawViewMode) ? rawViewMode : "list",
        filters,
    };
}

function appendValues(params: URLSearchParams, key: string, values: string[]) {
    values.forEach((value) => params.append(key, value));
}

function sameValues<T extends string>(left: T[], right: T[]) {
    if (left.length !== right.length) return false;
    const rightValues = new Set(right);
    return left.every((value) => rightValues.has(value));
}

export function buildCatalogQuery({
    preset,
    page,
    search,
    sort,
    viewMode,
    filters,
}: CatalogQueryState) {
    const params = new URLSearchParams();
    const defaults = createCatalogFilters(
        preset === "ongoing" ? AnimeStatus.ONGOING : undefined,
    );

    if (preset) params.set("preset", preset);
    if (search) params.set("q", search);
    if (sort !== "popular") params.set("sort", sort);
    if (viewMode !== "list") params.set("view", viewMode);
    if (page > 1) params.set("page", String(page));

    appendValues(params, "genre", filters.genres.include);
    appendValues(params, "excludeGenre", filters.genres.exclude);

    if (preset !== "ongoing" && !sameValues(filters.statuses, defaults.statuses)) {
        if (filters.statuses.length) appendValues(params, "status", filters.statuses);
        else params.set("status", "all");
    }

    appendValues(params, "type", filters.types);
    appendValues(params, "rating", filters.ratings);
    appendValues(params, "country", filters.countries);
    appendValues(params, "studio", filters.studios);
    appendValues(params, "producer", filters.producers);
    appendValues(params, "dubTeam", filters.dubTeams);

    if (!sameValues(filters.dubTypes, defaults.dubTypes)) {
        if (filters.dubTypes.length) appendValues(params, "dubType", filters.dubTypes);
        else params.set("dubType", "none");
    }

    if (filters.releaseMode === "range") params.set("releaseMode", "range");
    if (filters.releaseFrom) params.set("releaseFrom", filters.releaseFrom);
    if (filters.releaseMode === "range" && filters.releaseTo) {
        params.set("releaseTo", filters.releaseTo);
    }

    return params.toString();
}
