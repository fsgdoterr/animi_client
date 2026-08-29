"use client";

import type { ReactNode } from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/buttons/button";
import { Select, type SelectOption } from "@/components/ui/dropdowns/select";
import { Input } from "@/components/ui/inputs/input";
import Pagination from "@/components/ui/pagination/pagination";
import TableLoading from "@/components/ui/tables/table-loading";
import TableNotFound from "@/components/ui/tables/table-not-found";
import ErrorAlert from "@/components/ui/admin/shared/error-alert";

interface AdminListPageProps<TSort extends string> {
    title: string;
    totalCount?: number;
    createHref: string;
    createLabel: string;
    search: string;
    searchPlaceholder: string;
    onSearchChange: (value: string) => void;
    sortMode: TSort;
    sortOptions: SelectOption<TSort>[];
    onSortChange: (value: TSort) => void;
    error?: unknown;
    isLoading: boolean;
    isFetching: boolean;
    isEmpty: boolean;
    loadingTitle: string;
    emptyTitle: string;
    emptySubtitle: string;
    desktopContent: ReactNode;
    mobileContent: ReactNode;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function AdminListPage<TSort extends string>({
    title,
    totalCount,
    createHref,
    createLabel,
    search,
    searchPlaceholder,
    onSearchChange,
    sortMode,
    sortOptions,
    onSortChange,
    error,
    isLoading,
    isFetching,
    isEmpty,
    loadingTitle,
    emptyTitle,
    emptySubtitle,
    desktopContent,
    mobileContent,
    page,
    totalPages,
    onPageChange,
}: AdminListPageProps<TSort>) {
    const showLoading = isLoading || (isFetching && totalCount === undefined);

    return (
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
            <header className="flex shrink-0 flex-col gap-3 px-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 lg:min-h-[45px]">
                <div className="flex min-w-0 items-baseline gap-3">
                    <h1 className="truncate text-[24px] leading-tight text-white/92 sm:text-[26px] sm:leading-none">
                        {title}
                    </h1>
                    {totalCount !== undefined && (
                        <span className="hidden shrink-0 text-[14px] text-white/35 sm:inline">
                            {totalCount} усього
                        </span>
                    )}
                </div>
                <Button
                    href={createHref}
                    color="green"
                    className="w-full sm:w-auto"
                >
                    <Plus size={17} strokeWidth={2} />
                    {createLabel}
                </Button>
            </header>

            <div className="mt-3 grid shrink-0 gap-2 sm:grid-cols-[minmax(0,1fr)_220px] lg:grid-cols-[minmax(280px,1fr)_230px]">
                <Input
                    icon={<Search size={19} strokeWidth={1.8} />}
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder={searchPlaceholder}
                />
                <Select
                    label="Сортування"
                    value={sortMode}
                    options={sortOptions}
                    onChange={onSortChange}
                    className="w-full min-w-0"
                />
            </div>

            <ErrorAlert error={error} />

            <section className="mt-3 flex min-h-[260px] flex-1 flex-col overflow-hidden rounded-xl border border-white/[0.025] bg-[#11171c] shadow-[0_18px_60px_rgba(0,0,0,0.12)] sm:min-h-[320px]">
                <div className="min-h-0 flex-1 overflow-y-auto">
                    {showLoading ? (
                        <TableLoading title={loadingTitle} />
                    ) : isEmpty ? (
                        <TableNotFound
                            title={emptyTitle}
                            subtitle={emptySubtitle}
                        />
                    ) : (
                        <>
                            <div className="hidden h-full min-h-0 overflow-auto p-5 md:block">
                                {desktopContent}
                            </div>
                            <div className="grid gap-2 p-3 md:hidden">
                                {mobileContent}
                            </div>
                        </>
                    )}
                </div>

                <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalCount={totalCount ?? 0}
                    isLoading={isFetching}
                    onPageChange={onPageChange}
                />
            </section>
        </div>
    );
}
