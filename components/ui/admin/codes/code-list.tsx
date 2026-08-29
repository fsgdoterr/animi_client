"use client";

import { Hash } from "lucide-react";

import AdminListPage from "@/components/ui/admin/shared/admin-list-page";
import EntityActions from "@/components/ui/admin/shared/entity-actions";
import type { SelectOption } from "@/components/ui/dropdowns/select";
import TablePoster from "@/components/ui/tables/table-poster";
import {
    ADMIN_LIST_PAGE_SIZE,
    useAdminListControls,
    useClampPage,
} from "@/lib/hooks/use-admin-list-controls";
import {
    useDeleteCodeMutation,
    useGetCodesQuery,
} from "@/lib/store/animi/code-endpoints";
import type { AnimeCode, AnimeCodeSortMode } from "@/lib/types/entites/code";
import { formatDate } from "@/lib/utils/format-date";
import { animeTypeLabel } from "../animes/anime-options";

const sortOptions: SelectOption<AnimeCodeSortMode>[] = [
    { value: "new", label: "Нові" },
    { value: "old", label: "Старі" },
    { value: "code", label: "За кодом" },
    { value: "anime", label: "За аніме" },
    { value: "views", label: "За переглядами" },
];

export default function CodeList() {
    const controls = useAdminListControls<AnimeCodeSortMode>("new");
    const [deleteCode, deleteState] = useDeleteCodeMutation();
    const { data, isLoading, isFetching, error } = useGetCodesQuery({
        search: controls.deferredSearch || undefined,
        sort: controls.sortMode,
        page: controls.page,
        limit: ADMIN_LIST_PAGE_SIZE,
    });

    useClampPage(controls.page, data?.totalPages, controls.setPage);

    async function handleDelete(code: AnimeCode) {
        if (
            !window.confirm(
                `Видалити код «${code.code}» для аніме «${code.anime.title}»? Історія переглядів, повʼязана з цим кодом, також буде видалена.`,
            )
        ) {
            return;
        }

        try {
            await deleteCode(code.id).unwrap();
        } catch {
            // Mutation error is rendered by the list page.
        }
    }

    const codes = data?.items ?? [];

    return (
        <AdminListPage
            title="Коди"
            totalCount={data?.totalCount}
            createHref="/admin/codes/create"
            createLabel="Додати код"
            search={controls.search}
            searchPlaceholder="Пошук за кодом або назвою аніме"
            onSearchChange={controls.setSearch}
            sortMode={controls.sortMode}
            sortOptions={sortOptions}
            onSortChange={(value) => {
                controls.setSortMode(value);
                controls.setPage(1);
            }}
            error={error ?? deleteState.error}
            isLoading={isLoading}
            isFetching={isFetching}
            isEmpty={codes.length === 0}
            loadingTitle="Завантаження кодів..."
            emptyTitle="Кодів не знайдено"
            emptySubtitle="Змініть пошук або створіть новий код."
            desktopContent={
                <CodeTable
                    codes={codes}
                    onDelete={handleDelete}
                    deleteDisabled={deleteState.isLoading}
                />
            }
            mobileContent={
                <CodeCards
                    codes={codes}
                    onDelete={handleDelete}
                    deleteDisabled={deleteState.isLoading}
                />
            }
            page={controls.page}
            totalPages={Math.max(data?.totalPages ?? 1, 1)}
            onPageChange={controls.setPage}
        />
    );
}

interface CodeContentProps {
    codes: AnimeCode[];
    onDelete: (code: AnimeCode) => void;
    deleteDisabled: boolean;
}

function CodeTable({ codes, onDelete, deleteDisabled }: CodeContentProps) {
    return (
        <div className="min-w-[900px]">
            <div className="sticky top-0 z-10 grid grid-cols-[70px_170px_minmax(280px,1fr)_105px_170px_110px] items-center rounded-md bg-[#9a9d9f] px-4 py-2.5 text-[14px] text-white/90 shadow-sm">
                <span>ID</span>
                <span>Код</span>
                <span>Аніме</span>
                <span>Перегляди</span>
                <span>Створено</span>
                <span className="text-right">Дії</span>
            </div>

            {codes.map((code) => (
                <div
                    key={code.id}
                    className="grid grid-cols-[70px_170px_minmax(280px,1fr)_105px_170px_110px] items-center border-b border-white/[0.10] px-4 py-3 text-[14px] text-white/75 last:border-b-0 hover:bg-white/[0.018]"
                >
                    <span className="text-white/50">#{code.id}</span>
                    <CodeValue value={code.code} />
                    <AnimeIdentity code={code} />
                    <span className="tabular-nums text-white/62">
                        {code._count.views.toLocaleString("uk-UA")}
                    </span>
                    <span className="whitespace-nowrap text-white/52">
                        {formatDate(code.createdAt)}
                    </span>
                    <CodeActions
                        code={code}
                        onDelete={onDelete}
                        deleteDisabled={deleteDisabled}
                    />
                </div>
            ))}
        </div>
    );
}

function CodeCards({ codes, onDelete, deleteDisabled }: CodeContentProps) {
    return codes.map((code) => (
        <article
            key={code.id}
            className="rounded-lg border border-white/[0.06] bg-white/[0.018] p-3.5"
        >
            <div className="flex min-w-0 items-start gap-3">
                <TablePoster poster={code.anime.poster} title={code.anime.title} />
                <div className="min-w-0 flex-1">
                    <CodeValue value={code.code} />
                    <p className="mt-1 truncate text-[14px] text-white/65">
                        {code.anime.title}
                    </p>
                    <p className="mt-0.5 truncate text-[12px] text-white/30">
                        {animeTypeLabel(code.anime.type)} · #{code.animeId}
                    </p>
                </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.05] pt-3">
                <p className="min-w-0 truncate text-[13px] text-white/38">
                    #{code.id} · {code._count.views.toLocaleString("uk-UA")} переглядів · {formatDate(code.createdAt)}
                </p>
                <CodeActions
                    code={code}
                    onDelete={onDelete}
                    deleteDisabled={deleteDisabled}
                />
            </div>
        </article>
    ));
}

function CodeValue({ value }: { value: string }) {
    return (
        <div className="flex min-w-0 items-center gap-2">
            <Hash size={15} className="shrink-0 text-white/28" />
            <span className="truncate font-mono text-[14px] tracking-[0.035em] text-white/86">
                {value}
            </span>
        </div>
    );
}

function AnimeIdentity({ code }: { code: AnimeCode }) {
    return (
        <div className="flex min-w-0 items-center gap-3 pr-4">
            <TablePoster poster={code.anime.poster} title={code.anime.title} />
            <div className="min-w-0">
                <p className="truncate text-[15px] text-white/88">
                    {code.anime.title}
                </p>
                <p className="mt-0.5 truncate text-[12px] text-white/31">
                    {code.anime.originalTitle || code.anime.engTitle || animeTypeLabel(code.anime.type)} · #{code.animeId}
                </p>
            </div>
        </div>
    );
}

function CodeActions({
    code,
    onDelete,
    deleteDisabled,
}: {
    code: AnimeCode;
    onDelete: (code: AnimeCode) => void;
    deleteDisabled: boolean;
}) {
    return (
        <EntityActions
            editHref={`/admin/codes/${code.id}`}
            editLabel={`Редагувати код ${code.code}`}
            deleteLabel={`Видалити код ${code.code}`}
            onDelete={() => onDelete(code)}
            deleteDisabled={deleteDisabled}
        />
    );
}
