import type { PaginatedResult } from "@/lib/types/pagination";
export interface DubTeam {
    id: number;
    title: string;
    createdAt: string;
    updatedAt: string;
}

export interface DubTeamPayload {
    title: string;
}

export type DubTeamListResult = PaginatedResult<DubTeam>;
