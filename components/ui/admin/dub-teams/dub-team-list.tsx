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
    useDeleteDubTeamMutation,
    useGetDubTeamsQuery,
} from "@/lib/store/animi/dub-team-endpoints";
import type { DubTeam } from "@/lib/types/entites/dub-team";

export default function DubTeamList() {
    const controls = useAdminListControls<TitleSortMode>("new");
    const [deleteDubTeam, deleteState] = useDeleteDubTeamMutation();
    const { data, isLoading, isFetching, error } = useGetDubTeamsQuery({
        search: controls.deferredSearch || undefined,
        page: controls.page,
        limit: ADMIN_LIST_PAGE_SIZE,
    });

    useClampPage(controls.page, data?.totalPages, controls.setPage);

    async function handleDelete(team: DubTeam) {
        if (
            !window.confirm(
                `Видалити команду озвучення «${team.title}»? Цю дію не можна скасувати.`,
            )
        ) {
            return;
        }

        try {
            await deleteDubTeam(team.id).unwrap();
        } catch {
            // Mutation error is rendered by the list page.
        }
    }

    return (
        <TitleEntityList
            title="Команди озвучення"
            createHref="/admin/dub-teams/create"
            createLabel="Додати команду"
            baseHref="/admin/dub-teams"
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
            loadingTitle="Завантаження команд озвучення..."
            emptyTitle="Команд озвучення не знайдено"
            emptySubtitle="Змініть фільтри або створіть нову команду озвучення."
            editLabel={(team) => `Редагувати ${team.title}`}
            deleteLabel={(team) => `Видалити ${team.title}`}
            onDelete={handleDelete}
        />
    );
}
