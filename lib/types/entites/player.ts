import type { PaginatedResult } from "@/lib/types/pagination";
export interface Player {
    id: number;
    title: string;
    createdAt: string;
    updatedAt: string;
}

export interface PlayerPayload {
    title: string;
}

export type PlayerListResult = PaginatedResult<Player>;
