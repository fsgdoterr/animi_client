import type { PaginatedResult } from "@/lib/types/pagination";
import type { Image, PrivateImage } from "@/lib/types/entites/image-type";
import type { AnimeStatus, AnimeType } from "@/lib/types/entites/anime";

export interface AnimeCodeAnime {
    id: number;
    slug: string;
    title: string;
    originalTitle: string | null;
    engTitle: string | null;
    type: AnimeType;
    status: AnimeStatus;
    poster: Image | PrivateImage | null;
}

export interface AnimeCode {
    id: number;
    animeId: number;
    code: string;
    anime: AnimeCodeAnime;
    _count: {
        views: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface AnimeCodePayload {
    animeId: number;
    code: string;
}

export type AnimeCodeSortMode = "new" | "old" | "code" | "anime" | "views";

export interface AnimeCodeListParams {
    search?: string;
    sort?: AnimeCodeSortMode;
    page?: number;
    limit?: number;
}

export type AnimeCodeListResult = PaginatedResult<AnimeCode>;
