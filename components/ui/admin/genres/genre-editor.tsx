"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import PosterPicker from "@/components/ui/admin/genres/poster-picker";
import EntityStatsCard from "@/components/ui/admin/shared/entity-stats-card";
import {
    EditorBody,
    EditorError,
    EditorHeader,
    EditorPanel,
    SystemInfoCard,
} from "@/components/ui/admin/shared/editor-layout";
import { createFieldReset } from "@/components/ui/admin/shared/field-reset-config";
import FieldResetButton from "@/components/ui/admin/shared/field-reset-button";
import { FormField } from "@/components/ui/admin/shared/form-field";
import { Input } from "@/components/ui/inputs/input";
import {
    useCreateGenreMutation,
    useUpdateGenreMutation,
} from "@/lib/store/animi/genre-endpoints";
import type { Genre, GenrePayload } from "@/lib/types/entites/genre";
import type { GenreStats } from "@/lib/types/admin-stats";

type GenreFormValues = {
    title: string;
    poster: string | number | null;
};

export default function GenreEditor({ genre, stats }: { genre: Genre | null; stats?: GenreStats }) {
    const router = useRouter();
    const [createGenre, createState] = useCreateGenreMutation();
    const [updateGenre, updateState] = useUpdateGenreMutation();
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        resetField,
        formState: { errors, dirtyFields },
    } = useForm<GenreFormValues>({
        defaultValues: {
            title: genre?.title ?? "",
            poster: genre?.poster?.id ?? null,
        },
    });

    const poster = watch("poster");
    const isSaving = createState.isLoading || updateState.isLoading;
    const mutationError = createState.error ?? updateState.error;

    const onSubmit = handleSubmit(async (values) => {
        const title = values.title.trim();

        try {
            if (genre) {
                const body: Partial<GenrePayload> = {};
                if (dirtyFields.title) body.title = title;
                if (dirtyFields.poster) body.poster = values.poster;

                if (Object.keys(body).length > 0) {
                    await updateGenre({ id: genre.id, body }).unwrap();
                }
            } else {
                const body: GenrePayload = { title };
                if (values.poster !== null) body.poster = values.poster;
                await createGenre(body).unwrap();
            }

            router.push("/admin/genres");
        } catch {
            // Mutation error is rendered below the header.
        }
    });

    return (
        <form
            onSubmit={onSubmit}
            className="flex min-h-full min-w-0 flex-1 flex-col lg:h-full lg:min-h-0"
        >
            <EditorHeader
                backHref="/admin/genres"
                backLabel="Назад до жанрів"
                title={genre ? "Жанр" : "Створення жанру"}
                subtitle={genre ? `${genre.title} · #${genre.id}` : undefined}
                isSaving={isSaving}
                submitLabel={genre ? "Зберегти" : "Створити"}
            />
            <EditorError error={mutationError} />
            <EditorBody
                sidebar={
                    genre ? (
                        <div className="grid gap-3">
                            {stats && (
                                <EntityStatsCard
                                    metrics={[
                                        { label: "Аніме", value: stats.anime, hint: `${stats.announced} анонсованих` },
                                        { label: "Перегляди", value: stats.views },
                                        { label: "Оцінки", value: stats.reviews },
                                        { label: "Середня", value: stats.averageRating == null ? "—" : stats.averageRating.toFixed(1) },
                                        { label: "Онґоінги", value: stats.ongoing },
                                        { label: "Завершені", value: stats.completed },
                                    ]}
                                />
                            )}
                            <SystemInfoCard
                            id={genre.id}
                            createdAt={genre.createdAt}
                            updatedAt={genre.updatedAt}
                            />
                        </div>
                    ) : undefined
                }
            >
                <EditorPanel>
                    <div className="grid gap-6">
                        <div>
                            <h2 className="mb-5 text-[17px] font-medium text-white/88">
                                Основна інформація
                            </h2>
                            <FormField
                                label="Назва"
                                htmlFor="genre-title"
                                reset={createFieldReset(
                                    Boolean(genre),
                                    dirtyFields.title,
                                    () => resetField("title"),
                                    "Скинути назву до початкового значення",
                                )}
                                error={errors.title?.message}
                            >
                                <Input
                                    id="genre-title"
                                    {...register("title", {
                                        required: "Вкажіть назву жанру.",
                                        validate: (value) =>
                                            value.trim().length > 0 ||
                                            "Вкажіть назву жанру.",
                                    })}
                                    autoFocus={!genre}
                                    placeholder="Наприклад, Комедія"
                                    className="h-12 bg-[#181e23]"
                                />
                            </FormField>
                        </div>

                        <div className="border-t border-white/[0.06] pt-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-[17px] font-medium text-white/88">
                                        Постер
                                    </h2>
                                    <p className="mt-1 max-w-[620px] text-[14px] leading-5 text-white/35">
                                        Можна вставити посилання або використати вже
                                        завантажене зображення, привʼязане до аніме.
                                    </p>
                                </div>
                                {genre && (
                                    <FieldResetButton
                                        disabled={!dirtyFields.poster}
                                        onClick={() => resetField("poster")}
                                        ariaLabel="Скинути постер до початкового значення"
                                    />
                                )}
                            </div>
                            <div className="mt-4">
                                <PosterPicker
                                    value={poster}
                                    initialPoster={genre?.poster ?? null}
                                    onChange={(value) =>
                                        setValue("poster", value, {
                                            shouldDirty: true,
                                            shouldTouch: true,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </EditorPanel>
            </EditorBody>
        </form>
    );
}
