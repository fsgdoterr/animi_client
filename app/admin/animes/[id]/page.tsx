"use client";

import AnimeEditor from "@/components/ui/admin/animes/anime-editor";
import EntityEditPage, {
    useEntityId,
} from "@/components/ui/admin/shared/entity-edit-page";
import { useGetAnimeQuery } from "@/lib/store/animi/anime-endpoints";

export default function EditAnimePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const entityId = useEntityId(params);
    const { data, isLoading, error } = useGetAnimeQuery(entityId ?? 0, {
        skip: entityId === null,
    });

    return (
        <EntityEditPage
            entityId={entityId}
            data={data}
            isLoading={isLoading}
            error={error}
            labels={{
                title: "Редагування аніме",
                loadingText: "Завантаження аніме...",
                errorTitle: "Аніме не вдалося завантажити",
                fallbackMessage: "Перевірте ID аніме та спробуйте ще раз.",
                backHref: "/admin/animes",
                backLabel: "Повернутися до аніме",
            }}
            render={(entity) => <AnimeEditor key={entity.id} anime={entity} />}
        />
    );
}
