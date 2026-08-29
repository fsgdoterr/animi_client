"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import cn from "@/lib/utils/cn";
import { getVisiblePages } from "@/lib/utils/get-visible-pages";

interface PaginationProps {
    page: number;
    totalPages: number;
    totalCount?: number;
    isLoading?: boolean;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    page,
    totalPages,
    totalCount,
    isLoading = false,
    onPageChange,
}: PaginationProps) {
    const normalizedTotalPages = Math.max(totalPages, 1);

    return (
        <footer className="flex shrink-0 flex-col gap-2.5 border-t border-white/[0.06] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5">
            {totalCount !== undefined && (
                <span className="truncate text-[13px] text-white/38 sm:text-[14px]">
                    {totalCount} записів · сторінка {page} з {normalizedTotalPages}
                </span>
            )}

            <div className="flex w-full items-center justify-between gap-1 sm:w-auto sm:justify-start sm:gap-1.5">
                <PageButton
                    label="Попередня сторінка"
                    disabled={page <= 1 || isLoading}
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                >
                    <ChevronLeft size={18} />
                </PageButton>

                <div className="flex min-w-0 flex-1 items-center justify-center gap-1 sm:flex-none sm:gap-1.5">
                    {getVisiblePages(page, normalizedTotalPages).map(
                        (pageNumber) => (
                            <button
                                key={pageNumber}
                                type="button"
                                onClick={() => onPageChange(pageNumber)}
                                disabled={isLoading}
                                aria-current={
                                    pageNumber === page ? "page" : undefined
                                }
                                className={cn(
                                    "h-9 min-w-8 rounded-md px-1.5 text-[14px] transition sm:min-w-9 sm:px-2",
                                    pageNumber === page
                                        ? "bg-white/[0.12] text-white"
                                        : "text-white/50 hover:bg-white/[0.055] hover:text-white/80",
                                )}
                            >
                                {pageNumber}
                            </button>
                        ),
                    )}
                </div>

                <PageButton
                    label="Наступна сторінка"
                    disabled={page >= normalizedTotalPages || isLoading}
                    onClick={() =>
                        onPageChange(Math.min(normalizedTotalPages, page + 1))
                    }
                >
                    <ChevronRight size={18} />
                </PageButton>
            </div>
        </footer>
    );
}

function PageButton({
    label,
    disabled,
    onClick,
    children,
}: {
    label: string;
    disabled: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.035] text-white/65 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={label}
        >
            {children}
        </button>
    );
}
