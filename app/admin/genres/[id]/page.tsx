"use client";

import { use } from "react";
import { notFound } from "next/navigation";

import GenreEditor from "@/components/ui/admin/genres/genre-editor";
import {
    EntityEditError,
    EntityEditLoading,
} from "@/components/ui/admin/shared/entity-edit-state";
import { useGetGenreQuery } from "@/lib/store/animi/genre-endpoints";

export default function EditGenrePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const genreId = Number(id);
    const isValidGenreId = Number.isInteger(genreId) && genreId > 0;
    const { data, isLoading, error } = useGetGenreQuery(
        isValidGenreId ? genreId : 0,
        { skip: !isValidGenreId },
    );

    if (!isValidGenreId) notFound();

    if (isLoading) {
        return (
            <EntityEditLoading
                title="Редагування жанру"
                loadingText="Завантаження жанру..."
            />
        );
    }

    if (error || !data) {
        return (
            <EntityEditError
                title="Редагування жанру"
                errorTitle="Жанр не вдалося завантажити"
                error={error}
                fallbackMessage="Перевірте ID жанру та спробуйте ще раз."
                backHref="/admin/genres"
                backLabel="Повернутися до жанрів"
            />
        );
    }

    return <GenreEditor key={data.id} genre={data} />;
}
