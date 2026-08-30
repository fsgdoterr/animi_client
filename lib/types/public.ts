import type { AnimeRating, AnimeStatus, AnimeType, DubType } from "@/lib/types/entites/anime";
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
    genres: Genre[];
    releaseDate: string | null;
    episodesTotal: number | null;
    type: AnimeType;
    status: AnimeStatus;
    latestEpisodeNumber: number | null;
    dubEpisodesCount: number;
    subEpisodesCount: number;
    latestVariantAt?: string;
    availableDubTypes: DubType[];
    _count: {
        episodes: number;
        reviews: number;
        views: number;
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

export interface PublicAnimeDetails extends PublicAnimeCard {
    additionalImages: Image[];
    country: string | null;
    endDate: string | null;
    seasonNumber: number | null;
    partNumber: number | null;
    duration: number | null;
    studio: string | null;
    mal: string | null;
    al: string | null;
    producers: { id: number; title: string }[];
    averageReviewRating: number | null;
}
