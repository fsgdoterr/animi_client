"use client";

import PlayerEditor from "@/components/ui/admin/players/player-editor";
import EntityEditPage, {
    useEntityId,
} from "@/components/ui/admin/shared/entity-edit-page";
import { useGetPlayerQuery } from "@/lib/store/animi/player-endpoints";

import { useGetPlayerStatsQuery } from "@/lib/store/animi/admin-stats-endpoints";

export default function EditPlayerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const entityId = useEntityId(params);
    const { data, isLoading, error } = useGetPlayerQuery(entityId ?? 0, {
        skip: entityId === null,
    });
    const { data: stats } = useGetPlayerStatsQuery(entityId ?? 0, {
        skip: entityId === null,
    });

    return (
        <EntityEditPage
            entityId={entityId}
            data={data}
            isLoading={isLoading}
            error={error}
            labels={{
                title: "Редагування плеєра",
                loadingText: "Завантаження плеєра...",
                errorTitle: "Плеєр не вдалося завантажити",
                fallbackMessage: "Перевірте ID плеєра та спробуйте ще раз.",
                backHref: "/admin/players",
                backLabel: "Повернутися до плеєрів",
            }}
            render={(entity) => <PlayerEditor key={entity.id} player={entity} stats={stats} />}
        />
    );
}
