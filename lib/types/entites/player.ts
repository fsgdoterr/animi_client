import type { PaginatedResult } from "@/lib/types/pagination";
export interface Player {
    id: number;
    title: string;
    _count?: { episodeVariants: number };
    createdAt: string;
    updatedAt: string;
}

export interface PlayerPayload {
    title: string;
    _count?: { episodeVariants: number };
}

export type PlayerListResult = PaginatedResult<Player>;
