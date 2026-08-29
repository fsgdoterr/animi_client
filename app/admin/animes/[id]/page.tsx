"use client";

import { use } from "react";
import { notFound } from "next/navigation";

import AnimeEditor from "@/components/ui/admin/animes/anime-editor";
import {
    EntityEditError,
    EntityEditLoading,
} from "@/components/ui/admin/shared/entity-edit-state";
import { useGetAnimeQuery } from "@/lib/store/animi/anime-endpoints";

export default function EditAnimePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const animeId = Number(id);
    const isValidAnimeId = Number.isInteger(animeId) && animeId > 0;
    const { data, isLoading, error } = useGetAnimeQuery(
        isValidAnimeId ? animeId : 0,
        { skip: !isValidAnimeId },
    );

    if (!isValidAnimeId) notFound();

    if (isLoading) {
        return (
            <EntityEditLoading
                title="Редагування аніме"
                loadingText="Завантаження аніме..."
            />
        );
    }

    if (error || !data) {
        return (
            <EntityEditError
                title="Редагування аніме"
                errorTitle="Аніме не вдалося завантажити"
                error={error}
                fallbackMessage="Перевірте ID аніме та спробуйте ще раз."
                backHref="/admin/animes"
                backLabel="Повернутися до аніме"
            />
        );
    }

    return <AnimeEditor key={data.id} anime={data} />;
}
