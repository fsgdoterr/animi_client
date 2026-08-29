"use client";

import DubTeamEditor from "@/components/ui/admin/dub-teams/dub-team-editor";
import EntityEditPage, {
    useEntityId,
} from "@/components/ui/admin/shared/entity-edit-page";
import { useGetDubTeamQuery } from "@/lib/store/animi/dub-team-endpoints";

export default function EditDubTeamPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const entityId = useEntityId(params);
    const { data, isLoading, error } = useGetDubTeamQuery(entityId ?? 0, {
        skip: entityId === null,
    });

    return (
        <EntityEditPage
            entityId={entityId}
            data={data}
            isLoading={isLoading}
            error={error}
            labels={{
                title: "Редагування команди озвучення",
                loadingText: "Завантаження команди...",
                errorTitle: "Команду не вдалося завантажити",
                fallbackMessage: "Перевірте ID команди та спробуйте ще раз.",
                backHref: "/admin/dub-teams",
                backLabel: "Повернутися до команд",
            }}
            render={(entity) => <DubTeamEditor key={entity.id} team={entity} />}
        />
    );
}
