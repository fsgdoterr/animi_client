"use client";

import { use } from "react";
import { notFound } from "next/navigation";

import PlayerEditor from "@/components/ui/admin/players/player-editor";
import {
    EntityEditError,
    EntityEditLoading,
} from "@/components/ui/admin/shared/entity-edit-state";
import { useGetPlayerQuery } from "@/lib/store/animi/player-endpoints";

export default function EditPlayerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const entityId = Number(id);
    const isValidId = Number.isInteger(entityId) && entityId > 0;
    const { data, isLoading, error } = useGetPlayerQuery(
        isValidId ? entityId : 0,
        { skip: !isValidId },
    );

    if (!isValidId) notFound();

    if (isLoading) {
        return (
            <EntityEditLoading
                title="Редагування плеєра"
                loadingText="Завантаження плеєра..."
            />
        );
    }

    if (error || !data) {
        return (
            <EntityEditError
                title="Редагування плеєра"
                errorTitle="Плеєр не вдалося завантажити"
                error={error}
                fallbackMessage="Перевірте ID плеєра та спробуйте ще раз."
                backHref="/admin/players"
                backLabel="Повернутися до плеєрів"
            />
        );
    }

    return <PlayerEditor key={data.id} player={data} />;
}
