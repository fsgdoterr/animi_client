import { AnimeRating, AnimeStatus, AnimeType } from "@/lib/types/entites/anime";

export const animeTypeLabels: Record<AnimeType, string> = {
    [AnimeType.TV]: "TV-аніме",
    [AnimeType.MOVIE]: "Фільм",
    [AnimeType.OVA]: "OVA",
    [AnimeType.ONA]: "ONA",
    [AnimeType.SPECIAL]: "Спешл",
};

export const animeStatusLabels: Record<AnimeStatus, string> = {
    [AnimeStatus.DRAFT]: "Чернетка",
    [AnimeStatus.ONGOING]: "Онгоїнг",
    [AnimeStatus.ANNOUNCED]: "Анонс",
    [AnimeStatus.COMPLETED]: "Завершено",
    [AnimeStatus.CANCELED]: "Скасовано",
};

export const animeRatingLabels: Record<AnimeRating, string> = {
    [AnimeRating.G]: "G",
    [AnimeRating.PG]: "PG",
    [AnimeRating.PG13]: "PG-13",
    [AnimeRating.R]: "R",
    [AnimeRating.RPlus]: "R+",
    [AnimeRating.Rx]: "Rx",
};

export function imageSrc(path?: string | null) {
    return path ? `/uploads/${encodeURIComponent(path)}` : null;
}

export function compactDescription(value?: string | null, maxLength = 220) {
    if (!value) return "Опис поки що не додано.";
    const normalized = value.replace(/\s+/g, " ").trim();
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, maxLength).trimEnd()}…`;
}
