"use client";

import TitleEntityList, {
    type TitleSortMode,
} from "@/components/ui/admin/shared/title-entity-list";
import {
    ADMIN_LIST_PAGE_SIZE,
    useAdminListControls,
    useClampPage,
} from "@/lib/hooks/use-admin-list-controls";
import {
    useDeletePlayerMutation,
    useGetPlayersQuery,
} from "@/lib/store/animi/player-endpoints";
import type { Player } from "@/lib/types/entites/player";
import { runConfirmedMutation } from "@/lib/utils/confirm-mutation";

export default function PlayerList() {
    const controls = useAdminListControls<TitleSortMode>("new");
    const [deletePlayer, deleteState] = useDeletePlayerMutation();
    const { data, isLoading, isFetching, error } = useGetPlayersQuery({
        search: controls.deferredSearch || undefined,
        sort: controls.sortMode,
        page: controls.page,
        limit: ADMIN_LIST_PAGE_SIZE,
    });

    useClampPage(controls.page, data?.totalPages, controls.setPage);

    function handleDelete(player: Player) {
        return runConfirmedMutation(
            `Видалити плеєр «${player.title}»? Цю дію не можна скасувати.`,
            () => deletePlayer(player.id).unwrap(),
        );
    }

    return (
        <TitleEntityList
            title="Плеєри"
            createHref="/admin/players/create"
            createLabel="Додати плеєр"
            baseHref="/admin/players"
            data={data}
            search={controls.search}
            sortMode={controls.sortMode}
            page={controls.page}
            onSearchChange={controls.setSearch}
            onSortChange={controls.setSortMode}
            onPageChange={controls.setPage}
            isLoading={isLoading}
            isFetching={isFetching}
            error={error ?? deleteState.error}
            deleteDisabled={deleteState.isLoading}
            loadingTitle="Завантаження плеєрів..."
            emptyTitle="Плеєрів не знайдено"
            emptySubtitle="Змініть фільтри або створіть новий плеєр."
            editLabel={(player) => `Редагувати ${player.title}`}
            deleteLabel={(player) => `Видалити ${player.title}`}
            onDelete={handleDelete}
            description={(player) => `${player._count?.episodeVariants ?? 0} варіантів серій`}
        />
    );
}
