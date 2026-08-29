"use client";

import AdminListPage from "@/components/ui/admin/shared/admin-list-page";
import EntityActions from "@/components/ui/admin/shared/entity-actions";
import type { SelectOption } from "@/components/ui/dropdowns/select";
import type { ReactNode } from "react";
import type { PaginatedResult } from "@/lib/types/pagination";
import { formatDate } from "@/lib/utils/format-date";

export type TitleSortMode = "new" | "old" | "title" | "usage";

export const titleSortOptions: SelectOption<TitleSortMode>[] = [
    { value: "new", label: "Нові" },
    { value: "old", label: "Старі" },
    { value: "title", label: "А-Я" },
    { value: "usage", label: "За використанням" },
];

type TitleEntity = {
    id: number;
    title: string;
    createdAt: string;
};

export default function TitleEntityList<T extends TitleEntity>({
    title,
    createHref,
    createLabel,
    baseHref,
    data,
    search,
    sortMode,
    page,
    onSearchChange,
    onSortChange,
    onPageChange,
    isLoading,
    isFetching,
    error,
    deleteDisabled,
    loadingTitle,
    emptyTitle,
    emptySubtitle,
    editLabel,
    deleteLabel,
    onDelete,
    description,
}: {
    title: string;
    createHref: string;
    createLabel: string;
    baseHref: string;
    data?: PaginatedResult<T>;
    search: string;
    sortMode: TitleSortMode;
    page: number;
    onSearchChange: (value: string) => void;
    onSortChange: (value: TitleSortMode) => void;
    onPageChange: (page: number) => void;
    isLoading: boolean;
    isFetching: boolean;
    error?: unknown;
    deleteDisabled: boolean;
    loadingTitle: string;
    emptyTitle: string;
    emptySubtitle: string;
    editLabel: (entity: T) => string;
    deleteLabel: (entity: T) => string;
    onDelete: (entity: T) => void;
    description?: (entity: T) => ReactNode;
}) {
    const items = data?.items ?? [];

    const actions = (entity: T) => (
        <EntityActions
            editHref={`${baseHref}/${entity.id}`}
            editLabel={editLabel(entity)}
            deleteLabel={deleteLabel(entity)}
            onDelete={() => onDelete(entity)}
            deleteDisabled={deleteDisabled}
        />
    );

    return (
        <AdminListPage
            title={title}
            totalCount={data?.totalCount}
            createHref={createHref}
            createLabel={createLabel}
            search={search}
            searchPlaceholder="Пошук за назвою"
            onSearchChange={onSearchChange}
            sortMode={sortMode}
            sortOptions={titleSortOptions}
            onSortChange={onSortChange}
            error={error}
            isLoading={isLoading}
            isFetching={isFetching}
            isEmpty={items.length === 0}
            loadingTitle={loadingTitle}
            emptyTitle={emptyTitle}
            emptySubtitle={emptySubtitle}
            desktopContent={
                <div className="min-w-[720px]">
                    <div className="sticky top-0 z-10 grid grid-cols-[80px_minmax(260px,1fr)_175px_110px] items-center rounded-md bg-[#9a9d9f] px-4 py-2.5 text-[14px] text-white/90 shadow-sm">
                        <span>ID</span>
                        <span>Назва</span>
                        <span>Створено</span>
                        <span className="text-right">Дії</span>
                    </div>
                    {items.map((entity) => (
                        <div
                            key={entity.id}
                            className="grid grid-cols-[80px_minmax(260px,1fr)_175px_110px] items-center border-b border-white/[0.10] px-4 py-3 text-[14px] text-white/75 last:border-b-0 hover:bg-white/[0.018]"
                        >
                            <span className="text-white/50">#{entity.id}</span>
                            <div className="min-w-0 pr-4">
                                <p className="truncate text-[16px] text-white/90">{entity.title}</p>
                                {description && <div className="mt-0.5 truncate text-[12px] text-white/30">{description(entity)}</div>}
                            </div>
                            <span className="text-white/52">
                                {formatDate(entity.createdAt)}
                            </span>
                            {actions(entity)}
                        </div>
                    ))}
                </div>
            }
            mobileContent={items.map((entity) => (
                <article
                    key={entity.id}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.018] p-3.5"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className="break-words text-[16px] text-white/90">
                                {entity.title}
                            </h2>
                            <p className="mt-1 text-[13px] text-white/38">
                                #{entity.id} · {formatDate(entity.createdAt)}
                            </p>
                            {description && <div className="mt-1 text-[12px] text-white/30">{description(entity)}</div>}
                        </div>
                        {actions(entity)}
                    </div>
                </article>
            ))}
            page={page}
            totalPages={Math.max(data?.totalPages ?? 1, 1)}
            onPageChange={onPageChange}
        />
    );
}
