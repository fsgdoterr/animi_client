import type { UserRole } from "@/lib/constants/permissions";
import type { AnimeRating, AnimeStatus, AnimeType, DubType, EpisodeSourceType } from "@/lib/types/entites/anime";
import type { Genre } from "@/lib/types/entites/genre";
import type { Image, PrivateImage } from "@/lib/types/entites/image-type";

export interface PublicAnimeCard {
    id: number;
    slug: string;
    title: string;
    originalTitle: string | null;
    engTitle: string | null;
    poster: Image | null;
    rating: AnimeRating | null;
    description: string | null;
    country: string | null;
    studio: string | null;
    producers: { id: number; title: string }[];
    genres: Genre[];
    releaseDate: string | null;
    seasonNumber: number | null;
    partNumber: number | null;
    episodesTotal: number | null;
    type: AnimeType;
    status: AnimeStatus;
    latestEpisodeNumber: number | null;
    dubEpisodesCount: number;
    subEpisodesCount: number;
    latestVariantAt?: string;
    availableDubTypes: DubType[];
    averageReviewRating?: number | null;
    _count: {
        episodes: number;
        reviews: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface PublicHomeSliderItem {
    id: number;
    order: number;
    anime: PublicAnimeCard;
    image: Image | null;
}

export interface PublicHomeData {
    slider: PublicHomeSliderItem[];
    latestAnime: PublicAnimeCard[];
    latestEpisodes: PublicAnimeCard[];
}

export interface PublicSearchAnimeItem {
    id: number;
    slug: string;
    title: string;
    originalTitle: string | null;
    engTitle: string | null;
    poster: Image | null;
    rating: AnimeRating | null;
    type: AnimeType;
    status: AnimeStatus;
    episodesTotal: number | null;
    latestEpisodeNumber: number | null;
    dubEpisodesCount: number;
    subEpisodesCount: number;
}

export interface PublicSearchUserItem {
    id: number;
    username: string;
    displayName: string | null;
    avatar: Image | null;
}

export type PublicSearchResult =
    | { type: "anime"; items: PublicSearchAnimeItem[] }
    | { type: "user"; items: PublicSearchUserItem[] };

export interface AdminHomeSliderAnime {
    id: number;
    slug: string;
    title: string;
    originalTitle: string | null;
    engTitle: string | null;
    poster: Image | PrivateImage | null;
    rating: AnimeRating | null;
    releaseDate: string | null;
    type: AnimeType;
    status: AnimeStatus;
    createdAt: string;
    updatedAt: string;
}

export interface AdminHomeSliderItem {
    id: number;
    order: number;
    anime: AdminHomeSliderAnime;
    image: PrivateImage | null;
}

export interface PublicAnimeEpisodeVariant {
    id: number;
    sourceType: EpisodeSourceType;
    endpoint: string;
    dubType: DubType;
    dubTeam: { id: number; title: string };
    player: { id: number; title: string };
}

export interface PublicAnimeEpisode {
    id: number;
    number: number;
    title: string | null;
    variants: PublicAnimeEpisodeVariant[];
}

export interface PublicAnimeDetails extends PublicAnimeCard {
    additionalImages: Image[];
    endDate: string | null;
    duration: number | null;
    mal: string | null;
    al: string | null;
    episodes: PublicAnimeEpisode[];
    relatedAnimes: PublicAnimeCard[];
    recommendations: PublicAnimeCard[];
}

export interface PublicCommentUser {
    id: number;
    username: string;
    displayName: string | null;
    role: UserRole;
    avatar: Image | null;
}

export interface PublicCommentReplyTarget {
    id: number;
    text: string;
    user: PublicCommentUser;
}

export interface PublicAnimeComment {
    id: number;
    parentId: number | null;
    text: string;
    createdAt: string;
    updatedAt: string;
    user: PublicCommentUser;
    likes: number;
    dislikes: number;
    replyTo: PublicCommentReplyTarget | null;
    replies: PublicAnimeComment[];
}

export interface PublicAnimeCommentsResult {
    items: PublicAnimeComment[];
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
}


export interface PublicAnimeMeta {
    genres: { id: number; slug: string; title: string }[];
    producers: { id: number; title: string }[];
    dubTeams: { id: number; title: string }[];
    countries: string[];
    studios: string[];
    releaseYears: number[];
}
