import type { PaginatedResult } from "@/lib/types/pagination";
import type { DubTeam } from "@/lib/types/entites/dub-team";
import type { Genre } from "@/lib/types/entites/genre";
import type { Image, PrivateImage } from "@/lib/types/entites/image-type";
import type { Player } from "@/lib/types/entites/player";
import type { Producer } from "@/lib/types/entites/producer";

export enum AnimeType {
    TV = "TV",
    MOVIE = "MOVIE",
    OVA = "OVA",
    ONA = "ONA",
    SPECIAL = "SPECIAL",
}

export enum AnimeStatus {
    DRAFT = "DRAFT",
    ONGOING = "ONGOING",
    ANNOUNCED = "ANNOUNCED",
    COMPLETED = "COMPLETED",
    CANCELED = "CANCELED",
}

export enum AnimeRating {
    PG13 = "PG13",
    G = "G",
    Rx = "Rx",
    R = "R",
    RPlus = "RPlus",
    PG = "PG",
}

export enum EpisodeSourceType {
    IFRAME = "IFRAME",
}

export enum DubType {
    DUB = "DUB",
    SUB = "SUB",
}

export interface EpisodeVariant {
    id: number;
    sourceType: EpisodeSourceType;
    endpoint: string;
    dubType: DubType;
    isActive: boolean;
    dubTeam: DubTeam;
    player: Player;
    createdAt: string;
    updatedAt: string;
}

export interface AnimeEpisode {
    id: number;
    animeId: number;
    number: number;
    title: string | null;
    variants: EpisodeVariant[];
    createdAt: string;
    updatedAt: string;
}

export interface AnimeCounts {
    episodes: number;
    reviews: number;
    views: number;
}

export interface AnimeListItem {
    id: number;
    slug: string;
    title: string;
    originalTitle: string | null;
    engTitle: string | null;
    poster: Image | PrivateImage | null;
    genres: Genre[];
    rating: AnimeRating | null;
    releaseDate: string | null;
    type: AnimeType;
    status: AnimeStatus;
    _count: AnimeCounts;
    averageReviewRating: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface RelatedAnime {
    id: number;
    slug: string;
    title: string;
    originalTitle: string | null;
    engTitle: string | null;
    type: AnimeType;
    status: AnimeStatus;
    poster: Image | PrivateImage | null;
}

export interface Anime extends AnimeListItem {
    additionalImages: (Image | PrivateImage)[];
    description: string | null;
    country: string | null;
    endDate: string | null;
    episodesTotal: number | null;
    seasonNumber: number | null;
    partNumber: number | null;
    duration: number | null;
    studio: string | null;
    mal: string | null;
    al: string | null;
    producers: Producer[];
    relatedAnimes: RelatedAnime[];
}

export interface EpisodeVariantPayload {
    sourceType: EpisodeSourceType;
    endpoint: string;
    dubType: DubType;
    dubTeamId: number;
    playerId: number;
    isActive?: boolean;
}

export interface AnimeEpisodePayload {
    number: number;
    title?: string;
    variants?: EpisodeVariantPayload[];
}

export interface AnimePayload {
    title: string;
    originalTitle?: string | null;
    engTitle?: string | null;
    poster?: string | number | null;
    additionalImages?: (string | number | null)[];
    rating?: AnimeRating | null;
    description?: string | null;
    country?: string | null;
    genres?: string[];
    producers?: string[];
    relatedAnimeId?: number | null;
    releaseDate?: string | null;
    endDate?: string | null;
    episodesTotal?: number | null;
    seasonNumber?: number | null;
    partNumber?: number | null;
    duration?: number | null;
    type: AnimeType;
    status?: AnimeStatus;
    studio?: string | null;
    mal?: string | null;
    al?: string | null;
}

export type AnimeSortMode = "new" | "old" | "title" | "release" | "views";

export interface AnimeListParams {
    search?: string;
    genres?: string;
    status?: string;
    type?: string;
    sort?: AnimeSortMode;
    page?: number;
    limit?: number;
}

export type AnimeListResult = PaginatedResult<AnimeListItem>;
