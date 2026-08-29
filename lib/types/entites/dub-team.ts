import type { PaginatedResult } from "@/lib/types/pagination";
export interface DubTeam {
    id: number;
    title: string;
    _count?: { episodeVariants: number };
    createdAt: string;
    updatedAt: string;
}

export interface DubTeamPayload {
    title: string;
    _count?: { episodeVariants: number };
}

export type DubTeamListResult = PaginatedResult<DubTeam>;
