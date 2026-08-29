import type { PaginatedResult } from "@/lib/types/pagination";
import { Image, PrivateImage } from "@/lib/types/entites/image-type";

export interface Genre {
    id: number;
    slug: string;
    title: string;
    poster: Image | PrivateImage | null;
    createdAt: string;
    updatedAt: string;
}

export interface GenrePayload {
    title: string;
    poster?: string | number | null;
}

export type GenreListResult = PaginatedResult<Genre>;
