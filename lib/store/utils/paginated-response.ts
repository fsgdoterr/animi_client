import type { PaginatedResult } from "@/lib/types/pagination";

type ResponseMeta = { response?: Response } | undefined;

function readNumberHeader(
    meta: ResponseMeta,
    name: string,
    fallback: number,
) {
    const rawValue = meta?.response?.headers.get(name);
    const parsedValue = rawValue ? Number(rawValue) : Number.NaN;

    return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

export function toPaginatedResult<T>(
    items: T[],
    meta: ResponseMeta,
    defaultLimit: number,
): PaginatedResult<T> {
    return {
        items,
        page: readNumberHeader(meta, "X-Page", 1),
        limit: readNumberHeader(meta, "X-Limit", items.length || defaultLimit),
        totalCount: readNumberHeader(meta, "X-Total-Count", items.length),
        totalPages: readNumberHeader(
            meta,
            "X-TotalPages",
            items.length ? 1 : 0,
        ),
    };
}
