import type { PaginatedResult } from "@/lib/types/pagination";

export interface Producer {
    id: number;
    title: string;
    createdAt: string;
    updatedAt: string;
}

export type ProducerListResult = PaginatedResult<Producer>;
