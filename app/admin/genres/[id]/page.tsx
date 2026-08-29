"use client";

import GenreEditor from "@/components/ui/admin/genres/genre-editor";
import EntityEditPage, {
    useEntityId,
} from "@/components/ui/admin/shared/entity-edit-page";
import { useGetGenreQuery } from "@/lib/store/animi/genre-endpoints";

export default function EditGenrePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const entityId = useEntityId(params);
    const { data, isLoading, error } = useGetGenreQuery(entityId ?? 0, {
        skip: entityId === null,
    });

    return (
        <EntityEditPage
            entityId={entityId}
            data={data}
            isLoading={isLoading}
            error={error}
            labels={{
                title: "Редагування жанру",
                loadingText: "Завантаження жанру...",
                errorTitle: "Жанр не вдалося завантажити",
                fallbackMessage: "Перевірте ID жанру та спробуйте ще раз.",
                backHref: "/admin/genres",
                backLabel: "Повернутися до жанрів",
            }}
            render={(entity) => <GenreEditor key={entity.id} genre={entity} />}
        />
    );
}
