import type { MultiSelectOption } from "@/components/ui/dropdowns/multi-select";
import type { SelectOption } from "@/components/ui/dropdowns/select";
import {
    AnimeRating,
    AnimeStatus,
    AnimeType,
    DubType,
    EpisodeSourceType,
    type AnimeSortMode,
} from "@/lib/types/entites/anime";

export const animeTypeOptions: SelectOption<AnimeType>[] = [
    { value: AnimeType.TV, label: "TV-аніме" },
    { value: AnimeType.MOVIE, label: "Фільм" },
    { value: AnimeType.OVA, label: "OVA" },
    { value: AnimeType.ONA, label: "ONA" },
    { value: AnimeType.SPECIAL, label: "Спешл" },
];

export const animeStatusOptions: SelectOption<AnimeStatus>[] = [
    { value: AnimeStatus.DRAFT, label: "Чернетка" },
    { value: AnimeStatus.ONGOING, label: "Онґоїнг" },
    { value: AnimeStatus.ANNOUNCED, label: "Анонс" },
    { value: AnimeStatus.COMPLETED, label: "Завершено" },
    { value: AnimeStatus.CANCELED, label: "Скасовано" },
];

export const animeRatingOptions: SelectOption<AnimeRating>[] = [
    { value: AnimeRating.G, label: "G" },
    { value: AnimeRating.PG, label: "PG" },
    { value: AnimeRating.PG13, label: "PG-13" },
    { value: AnimeRating.R, label: "R" },
    { value: AnimeRating.RPlus, label: "R+" },
    { value: AnimeRating.Rx, label: "Rx" },
];

export const animeSortOptions: SelectOption<AnimeSortMode>[] = [
    { value: "new", label: "Найновіші" },
    { value: "old", label: "Найстаріші" },
    { value: "title", label: "За назвою" },
    { value: "release", label: "За датою релізу" },
    { value: "views", label: "Найбільше переглядів" },
];

export const animeTypeFilterOptions: MultiSelectOption<AnimeType>[] =
    animeTypeOptions.map((option) => ({
        value: option.value,
        label: String(option.label),
    }));

export const animeStatusFilterOptions: MultiSelectOption<AnimeStatus>[] =
    animeStatusOptions.map((option) => ({
        value: option.value,
        label: String(option.label),
    }));

export const animeRatingFilterOptions: MultiSelectOption<AnimeRating>[] =
    animeRatingOptions.map((option) => ({
        value: option.value,
        label: String(option.label),
    }));

export const dubTypeOptions: SelectOption<DubType>[] = [
    { value: DubType.DUB, label: "Озвучка" },
    { value: DubType.SUB, label: "Субтитри" },
];

export const episodeSourceOptions: SelectOption<EpisodeSourceType>[] = [
    { value: EpisodeSourceType.IFRAME, label: "iframe" },
];

export function animeStatusLabel(status: AnimeStatus) {
    return animeStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export function animeTypeLabel(type: AnimeType) {
    return animeTypeOptions.find((option) => option.value === type)?.label ?? type;
}

export function animeRatingLabel(rating: AnimeRating | null) {
    if (!rating) return "—";
    return animeRatingOptions.find((option) => option.value === rating)?.label ?? rating;
}
