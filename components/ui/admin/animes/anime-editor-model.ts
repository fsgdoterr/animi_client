import type { AnimeImportData } from "@/components/ui/admin/animes/anime-json-import-modal";
import {
    AnimeRating,
    AnimeStatus,
    AnimeType,
    DubType,
    EpisodeSourceType,
    type Anime,
    type AnimeEpisode,
    type AnimeEpisodePayload,
    type AnimePayload,
    type EpisodeVariantPayload,
} from "@/lib/types/entites/anime";

export type RatingValue = AnimeRating | "";

export type EpisodeVariantForm = {
    key: string;
    sourceType: EpisodeSourceType;
    endpoint: string;
    dubType: DubType;
    dubTeamId: string;
    playerId: string;
    isActive: boolean;
};

export type EpisodeForm = {
    key: string;
    number: string;
    title: string;
    variants: EpisodeVariantForm[];
};

export type AnimeFormValues = {
    title: string;
    originalTitle: string;
    engTitle: string;
    description: string;
    type: AnimeType;
    status: AnimeStatus;
    rating: RatingValue;
    poster: string | number | null;
    additionalImages: (string | number | null)[];
    genres: string[];
    producers: string[];
    relatedAnimeId: number | null;
    releaseDate: string;
    endDate: string;
    episodesTotal: string;
    seasonNumber: string;
    partNumber: string;
    duration: string;
    country: string;
    studio: string;
    mal: string;
    al: string;
};

export function toImportFormPatch(
    data: AnimeImportData,
): Partial<AnimeFormValues> {
    const patch: Partial<AnimeFormValues> = {};

    if (data.title !== undefined) patch.title = data.title;
    if (data.originalTitle !== undefined)
        patch.originalTitle = data.originalTitle ?? "";
    if (data.engTitle !== undefined) patch.engTitle = data.engTitle ?? "";
    if (data.description !== undefined)
        patch.description = data.description ?? "";
    if (data.type !== undefined) patch.type = data.type;
    if (data.status !== undefined) patch.status = data.status;
    if (data.rating !== undefined) patch.rating = data.rating ?? "";
    if (data.poster !== undefined) patch.poster = data.poster;
    if (data.additionalImages !== undefined)
        patch.additionalImages = data.additionalImages;
    if (data.genres !== undefined) patch.genres = data.genres;
    if (data.producers !== undefined) patch.producers = data.producers;
    if (data.relatedAnimeId !== undefined)
        patch.relatedAnimeId = data.relatedAnimeId;
    if (data.releaseDate !== undefined)
        patch.releaseDate = data.releaseDate ?? "";
    if (data.endDate !== undefined) patch.endDate = data.endDate ?? "";
    if (data.episodesTotal !== undefined)
        patch.episodesTotal = numberToInput(data.episodesTotal);
    if (data.seasonNumber !== undefined)
        patch.seasonNumber = numberToInput(data.seasonNumber);
    if (data.partNumber !== undefined)
        patch.partNumber = numberToInput(data.partNumber);
    if (data.duration !== undefined)
        patch.duration = numberToInput(data.duration);
    if (data.country !== undefined) patch.country = data.country ?? "";
    if (data.studio !== undefined) patch.studio = data.studio ?? "";
    if (data.mal !== undefined) patch.mal = data.mal ?? "";
    if (data.al !== undefined) patch.al = data.al ?? "";

    return patch;
}

export function toFormValues(anime: Anime | null): AnimeFormValues {
    return {
        title: anime?.title ?? "",
        originalTitle: anime?.originalTitle ?? "",
        engTitle: anime?.engTitle ?? "",
        description: anime?.description ?? "",
        type: anime?.type ?? AnimeType.TV,
        status: anime?.status ?? AnimeStatus.DRAFT,
        rating: anime?.rating ?? "",
        poster: anime?.poster?.id ?? null,
        additionalImages: anime?.additionalImages.map((image) => image.id) ?? [],
        genres: anime?.genres.map((genre) => genre.title) ?? [],
        producers: anime?.producers.map((producer) => producer.title) ?? [],
        relatedAnimeId: anime?.relatedAnimes[0]?.id ?? null,
        releaseDate: toDateInput(anime?.releaseDate),
        endDate: toDateInput(anime?.endDate),
        episodesTotal: numberToInput(anime?.episodesTotal),
        seasonNumber: numberToInput(anime?.seasonNumber),
        partNumber: numberToInput(anime?.partNumber),
        duration: numberToInput(anime?.duration),
        country: anime?.country ?? "",
        studio: anime?.studio ?? "",
        mal: anime?.mal ?? "",
        al: anime?.al ?? "",
    };
}

export function toEpisodeForms(episodes: AnimeEpisode[]): EpisodeForm[] {
    return episodes
        .map((episode) => ({
            key: `episode-${episode.id}`,
            number: String(episode.number),
            title: episode.title ?? "",
            variants: episode.variants.map((variant) => ({
                key: `variant-${variant.id}`,
                sourceType: variant.sourceType,
                endpoint: variant.endpoint,
                dubType: variant.dubType,
                dubTeamId: String(variant.dubTeam.id),
                playerId: String(variant.player.id),
                isActive: variant.isActive,
            })),
        }))
        .sort((a, b) => Number(a.number) - Number(b.number));
}

export function cloneEpisodeForms(episodes: EpisodeForm[]): EpisodeForm[] {
    return episodes.map(cloneEpisodeForm);
}

export function cloneEpisodeForm(episode: EpisodeForm): EpisodeForm {
    return {
        ...episode,
        variants: episode.variants.map((variant) => ({ ...variant })),
    };
}

export function areVariantsEqual(
    left: EpisodeVariantForm,
    right: EpisodeVariantForm,
) {
    return (
        left.sourceType === right.sourceType &&
        left.endpoint === right.endpoint &&
        left.dubType === right.dubType &&
        left.dubTeamId === right.dubTeamId &&
        left.playerId === right.playerId &&
        left.isActive === right.isActive
    );
}

export function areSingleEpisodeEqual(left: EpisodeForm, right: EpisodeForm) {
    if (left.number !== right.number || left.title !== right.title) return false;
    if (left.variants.length !== right.variants.length) return false;

    return left.variants.every((variant, index) => {
        const matching =
            right.variants.find((item) => item.key === variant.key) ??
            right.variants[index];
        return Boolean(matching) && areVariantsEqual(variant, matching);
    });
}

export function areEpisodeFormsEqual(left: EpisodeForm[], right: EpisodeForm[]) {
    if (left.length !== right.length) return false;

    const normalize = (episodes: EpisodeForm[]) =>
        [...episodes]
            .sort((a, b) => Number(a.number) - Number(b.number))
            .map((episode) => ({
                number: episode.number,
                title: episode.title,
                variants: episode.variants.map((variant) => ({
                    sourceType: variant.sourceType,
                    endpoint: variant.endpoint,
                    dubType: variant.dubType,
                    dubTeamId: variant.dubTeamId,
                    playerId: variant.playerId,
                    isActive: variant.isActive,
                })),
            }));

    return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right));
}

export function buildAnimePayload(values: AnimeFormValues): AnimePayload {
    return {
        title: values.title.trim(),
        originalTitle: nullableString(values.originalTitle),
        engTitle: nullableString(values.engTitle),
        description: nullableString(values.description),
        type: values.type,
        status: values.status,
        rating: values.rating || null,
        poster: values.poster,
        additionalImages: values.additionalImages,
        genres: values.genres,
        producers: values.producers,
        relatedAnimeId: values.relatedAnimeId,
        releaseDate: nullableString(values.releaseDate),
        endDate: nullableString(values.endDate),
        ...getTypeNumberPayload(values),
        duration: nullableNumber(values.duration),
        country: nullableString(values.country),
        studio: nullableString(values.studio),
        mal: nullableString(values.mal),
        al: nullableString(values.al),
    };
}

export function buildEpisodePayload(
    episodes: EpisodeForm[],
): AnimeEpisodePayload[] | string {
    const result: AnimeEpisodePayload[] = [];
    const episodeNumbers = new Set<number>();

    for (const [episodeIndex, episode] of episodes.entries()) {
        const number = Number(episode.number);
        if (!Number.isInteger(number) || number < 1) {
            return `Серія ${episodeIndex + 1}: вкажіть коректний номер.`;
        }
        if (episodeNumbers.has(number)) {
            return `Серія №${number} додана більше одного разу.`;
        }
        episodeNumbers.add(number);

        const variants: EpisodeVariantPayload[] = [];
        const variantKeys = new Set<string>();
        for (const [variantIndex, variant] of episode.variants.entries()) {
            const dubTeamId = Number(variant.dubTeamId);
            const playerId = Number(variant.playerId);

            if (!variant.endpoint.trim()) {
                return `Серія №${number}, варіант ${variantIndex + 1}: вкажіть посилання або endpoint.`;
            }
            if (!Number.isInteger(dubTeamId) || dubTeamId < 1) {
                return `Серія №${number}, варіант ${variantIndex + 1}: оберіть команду озвучення.`;
            }
            if (!Number.isInteger(playerId) || playerId < 1) {
                return `Серія №${number}, варіант ${variantIndex + 1}: оберіть плеєр.`;
            }

            const variantKey = `${variant.dubType}:${dubTeamId}:${playerId}`;
            if (variantKeys.has(variantKey)) {
                return `Серія №${number}: однаковий варіант озвучення/плеєра додано двічі.`;
            }
            variantKeys.add(variantKey);

            variants.push({
                sourceType: variant.sourceType,
                endpoint: variant.endpoint.trim(),
                dubType: variant.dubType,
                dubTeamId,
                playerId,
                isActive: variant.isActive,
            });
        }

        result.push({
            number,
            title: nullableString(episode.title) ?? undefined,
            variants,
        });
    }

    return result.sort((a, b) => a.number - b.number);
}

export function buildUpdatePayload(
    payload: AnimePayload,
    dirtyFields: Partial<Record<keyof AnimeFormValues, unknown>>,
): Partial<AnimePayload> {
    const body: Partial<AnimePayload> = {};

    const directFields = [
        "title",
        "originalTitle",
        "engTitle",
        "description",
        "type",
        "status",
        "rating",
        "poster",
        "additionalImages",
        "genres",
        "producers",
        "relatedAnimeId",
        "releaseDate",
        "endDate",
        "duration",
        "country",
        "studio",
        "mal",
        "al",
    ] as const;

    for (const field of directFields) {
        if (dirtyFields[field]) Object.assign(body, { [field]: payload[field] });
    }

    if (dirtyFields.episodesTotal || dirtyFields.type)
        body.episodesTotal = payload.episodesTotal;
    if (dirtyFields.seasonNumber || dirtyFields.type)
        body.seasonNumber = payload.seasonNumber;
    if (dirtyFields.partNumber || dirtyFields.type)
        body.partNumber = payload.partNumber;

    return body;
}

export function mergeNameOptions<T extends { id: number; title: string }>(
    primary: T[],
    selected: T[],
): T[] {
    const byId = new Map(primary.map((item) => [item.id, item]));
    for (const item of selected) byId.set(item.id, item);
    return [...byId.values()];
}

function getTypeNumberPayload(values: AnimeFormValues) {
    if (values.type === AnimeType.TV) {
        return {
            episodesTotal: nullableNumber(values.episodesTotal),
            seasonNumber: nullableNumber(values.seasonNumber),
            partNumber: nullableNumber(values.partNumber),
        };
    }
    if (values.type === AnimeType.MOVIE) {
        return {
            episodesTotal: null,
            seasonNumber: null,
            partNumber: nullableNumber(values.partNumber),
        };
    }
    return {
        episodesTotal: null,
        seasonNumber: null,
        partNumber: null,
    };
}

function nullableString(value: string) {
    const normalized = value.trim();
    return normalized ? normalized : null;
}

function nullableNumber(value: string) {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function numberToInput(value: number | null | undefined) {
    return value == null ? "" : String(value);
}

function toDateInput(value: string | null | undefined) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
}
