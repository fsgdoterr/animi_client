"use client";

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
    useDeleteGenreMutation,
    useGetGenresQuery,
} from "@/lib/store/animi/genre-endpoints";
import type { Genre } from "@/lib/types/entites/genre";
import { formatDate } from "@/lib/utils/format-date";
import { runConfirmedMutation } from "@/lib/utils/confirm-mutation";

type SortMode = "new" | "old" | "title";

const sortOptions: SelectOption<SortMode>[] = [
    { value: "new", label: "Нові" },
    { value: "old", label: "Старі" },
    { value: "title", label: "А-Я" },
];

export default function GenreList() {
    const controls = useAdminListControls<SortMode>("new");
    const [deleteGenre, deleteState] = useDeleteGenreMutation();
    const { data, isLoading, isFetching, error } = useGetGenresQuery({
        search: controls.deferredSearch || undefined,
        sort: controls.sortMode,
        page: controls.page,
        limit: ADMIN_LIST_PAGE_SIZE,
    });

    useClampPage(controls.page, data?.totalPages, controls.setPage);

    const genres = data?.items ?? [];

    function handleDelete(genre: Genre) {
        return runConfirmedMutation(
            `Видалити жанр «${genre.title}»? Цю дію не можна скасувати.`,
            () => deleteGenre(genre.id).unwrap(),
        );
    }

    return (
        <AdminListPage
            title="Жанри"
            totalCount={data?.totalCount}
            createHref="/admin/genres/create"
            createLabel="Додати жанр"
            search={controls.search}
            searchPlaceholder="Пошук за назвою"
            onSearchChange={controls.setSearch}
            sortMode={controls.sortMode}
            sortOptions={sortOptions}
            onSortChange={controls.setSortMode}
            error={error ?? deleteState.error}
            isLoading={isLoading}
            isFetching={isFetching}
            isEmpty={genres.length === 0}
            loadingTitle="Завантаження жанрів..."
            emptyTitle="Жанрів не знайдено"
            emptySubtitle="Змініть фільтри або створіть новий жанр."
            desktopContent={<GenreTable genres={genres} onDelete={handleDelete} deleteDisabled={deleteState.isLoading} />}
            mobileContent={<GenreCards genres={genres} onDelete={handleDelete} deleteDisabled={deleteState.isLoading} />}
            page={controls.page}
            totalPages={Math.max(data?.totalPages ?? 1, 1)}
            onPageChange={controls.setPage}
        />
    );
}

type GenreContentProps = {
    genres: Genre[];
    onDelete: (genre: Genre) => void;
    deleteDisabled: boolean;
};

function GenreTable({ genres, onDelete, deleteDisabled }: GenreContentProps) {
    return (
        <div className="min-w-[800px]">
            <div className="sticky top-0 z-10 grid grid-cols-[80px_minmax(290px,1fr)_175px_110px] items-center rounded-md bg-[#9a9d9f] px-4 py-2.5 text-[14px] text-white/90 shadow-sm">
                <span>ID</span>
                <span>Назва</span>
                <span>Створено</span>
                <span className="text-right">Дії</span>
            </div>
            {genres.map((genre) => (
                <div
                    key={genre.id}
                    className="grid grid-cols-[80px_minmax(290px,1fr)_175px_110px] items-center border-b border-white/[0.10] px-4 py-3 text-[14px] text-white/75 last:border-b-0 hover:bg-white/[0.018]"
                >
                    <span className="text-white/50">#{genre.id}</span>
                    <GenreIdentity genre={genre} />
                    <span className="text-white/52">
                        {formatDate(genre.createdAt)}
                    </span>
                    <GenreActions genre={genre} onDelete={onDelete} deleteDisabled={deleteDisabled} />
                </div>
            ))}
        </div>
    );
}

function GenreCards({ genres, onDelete, deleteDisabled }: GenreContentProps) {
    return genres.map((genre) => (
        <article
            key={genre.id}
            className="rounded-lg border border-white/[0.06] bg-white/[0.018] p-3.5"
        >
            <div className="flex min-w-0 items-start gap-3">
                <TablePoster poster={genre.poster} title={genre.title} />
                <div className="min-w-0 flex-1">
                    <h2 className="break-words text-[16px] text-white/90">
                        {genre.title}
                    </h2>
                    <p className="mt-0.5 truncate font-mono text-[12px] text-white/32">
                        {genre.slug}
                    </p>
                </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.05] pt-3">
                <p className="min-w-0 truncate text-[13px] text-white/38">
                    #{genre.id} · {formatDate(genre.createdAt)}
                </p>
                <GenreActions genre={genre} onDelete={onDelete} deleteDisabled={deleteDisabled} />
            </div>
        </article>
    ));
}

function GenreIdentity({ genre }: { genre: Genre }) {
    return (
        <div className="flex min-w-0 items-center gap-3 pr-4">
            <TablePoster poster={genre.poster} title={genre.title} />
            <div className="min-w-0">
                <p className="truncate text-[16px] text-white/90">
                    {genre.title}
                </p>
                <p className="mt-0.5 truncate font-mono text-[13px] text-white/32">
                    {genre.slug}
                </p>
            </div>
        </div>
    );
}

function GenreActions({
    genre,
    onDelete,
    deleteDisabled,
}: {
    genre: Genre;
    onDelete: (genre: Genre) => void;
    deleteDisabled: boolean;
}) {
    return (
        <EntityActions
            editHref={`/admin/genres/${genre.id}`}
            editLabel={`Редагувати ${genre.title}`}
            deleteLabel={`Видалити ${genre.title}`}
            onDelete={() => onDelete(genre)}
            deleteDisabled={deleteDisabled}
        />
    );
}
