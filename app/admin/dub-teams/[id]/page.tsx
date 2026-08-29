"use client";

import { use } from "react";
import { notFound } from "next/navigation";

import DubTeamEditor from "@/components/ui/admin/dub-teams/dub-team-editor";
import {
    EntityEditError,
    EntityEditLoading,
} from "@/components/ui/admin/shared/entity-edit-state";
import { useGetDubTeamQuery } from "@/lib/store/animi/dub-team-endpoints";

export default function EditDubTeamPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const entityId = Number(id);
    const isValidId = Number.isInteger(entityId) && entityId > 0;
    const { data, isLoading, error } = useGetDubTeamQuery(
        isValidId ? entityId : 0,
        { skip: !isValidId },
    );

    if (!isValidId) notFound();

    if (isLoading) {
        return (
            <EntityEditLoading
                title="Редагування команди озвучення"
                loadingText="Завантаження команди..."
            />
        );
    }

    if (error || !data) {
        return (
            <EntityEditError
                title="Редагування команди озвучення"
                errorTitle="Команду не вдалося завантажити"
                error={error}
                fallbackMessage="Перевірте ID команди та спробуйте ще раз."
                backHref="/admin/dub-teams"
                backLabel="Повернутися до команд"
            />
        );
    }

    return <DubTeamEditor key={data.id} team={data} />;
}
