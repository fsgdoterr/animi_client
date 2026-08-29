"use client";

import { useDeferredValue, useEffect, useState } from "react";

export const ADMIN_LIST_PAGE_SIZE = 20;

export function useAdminListControls<TSort extends string>(
    initialSort: TSort,
) {
    const [search, setSearchValue] = useState("");
    const [sortMode, setSortMode] = useState<TSort>(initialSort);
    const [page, setPage] = useState(1);
    const deferredSearch = useDeferredValue(search.trim());

    const setSearch = (value: string) => {
        setSearchValue(value);
        setPage(1);
    };

    return {
        search,
        deferredSearch,
        sortMode,
        page,
        setSearch,
        setSortMode,
        setPage,
    };
}

export function useClampPage(
    page: number,
    totalPages: number | undefined,
    setPage: (page: number) => void,
) {
    useEffect(() => {
        if (totalPages && page > totalPages) {
            setPage(totalPages);
        }
    }, [page, setPage, totalPages]);
}
