"use client";

import type { UseFormReturn } from "react-hook-form";

import EntityStatsCard from "@/components/ui/admin/shared/entity-stats-card";
import AdditionalImagesPicker from "@/components/ui/admin/animes/additional-images-picker";
import {
    EditorSection,
    EditorSideCard,
} from "@/components/ui/admin/animes/anime-editor-layout";
import type {
    AnimeFormValues,
    RatingValue,
} from "@/components/ui/admin/animes/anime-editor-model";
import GenrePicker from "@/components/ui/admin/animes/genre-picker";
import ProducerPicker from "@/components/ui/admin/animes/producer-picker";
import RelatedAnimePicker from "@/components/ui/admin/animes/related-anime-picker";
import PosterPicker from "@/components/ui/admin/genres/poster-picker";
import {
    EditorBody,
    EditorPanel,
    SystemInfoCard,
} from "@/components/ui/admin/shared/editor-layout";
import { createFieldReset } from "@/components/ui/admin/shared/field-reset-config";
import { FormField } from "@/components/ui/admin/shared/form-field";
import { Select, type SelectOption } from "@/components/ui/dropdowns/select";
import { Input } from "@/components/ui/inputs/input";
import { AnimeType, type Anime } from "@/lib/types/entites/anime";
import type { Genre } from "@/lib/types/entites/genre";
import type { Producer } from "@/lib/types/entites/producer";
import type { AnimeStats } from "@/lib/types/admin-stats";
import cn from "@/lib/utils/cn";
import {
    animeRatingOptions,
    animeStatusOptions,
    animeTypeOptions,
} from "./anime-options";

const ratingOptions: SelectOption<RatingValue>[] = [
    { value: "", label: "Не вказано" },
    ...animeRatingOptions,
];

export default function AnimeMainTab({
    anime,
    form,
    genreOptions,
    producerOptions,
    stats,
}: {
    anime: Anime | null;
    form: UseFormReturn<AnimeFormValues>;
    genreOptions: Genre[];
    producerOptions: Producer[];
    stats?: AnimeStats;
}) {
    const {
        register,
        watch,
        setValue,
        resetField,
        formState: { errors, dirtyFields },
    } = form;
    const type = watch("type");
    const status = watch("status");
    const rating = watch("rating");
    const poster = watch("poster");
    const additionalImages = watch("additionalImages");
    const genres = watch("genres");
    const producers = watch("producers");
    const relatedAnimeId = watch("relatedAnimeId");

    const fieldReset = (field: keyof AnimeFormValues, label: string) =>
        createFieldReset(
            Boolean(anime),
            dirtyFields[field],
            () => resetField(field),
            `Скинути ${label} до початкового значення`,
        );

    const typeReset = anime
        ? {
              disabled: !Boolean(
                  dirtyFields.type ||
                      dirtyFields.episodesTotal ||
                      dirtyFields.seasonNumber ||
                      dirtyFields.partNumber,
              ),
              onClick: () => {
                  resetField("type");
                  resetField("episodesTotal");
                  resetField("seasonNumber");
                  resetField("partNumber");
              },
              ariaLabel: "Скинути тип та нумерацію до початкових значень",
          }
        : undefined;

    function handleTypeChange(nextType: AnimeType) {
        setValue("type", nextType, { shouldDirty: true });
        if (nextType === AnimeType.TV) return;

        setValue("episodesTotal", "", { shouldDirty: true });
        setValue("seasonNumber", "", { shouldDirty: true });
        if (nextType !== AnimeType.MOVIE) {
            setValue("partNumber", "", { shouldDirty: true });
        }
    }

    return (
        <EditorBody
            unifiedScroll
            sidebar={
                <div className="grid gap-4">
                    {anime && stats && (
                        <EntityStatsCard
                            metrics={[
                                { label: "Перегляди", value: stats.views, hint: `${stats.views7} за 7 днів` },
                                { label: "30 днів", value: stats.views30 },
                                { label: "Оцінки", value: stats.reviews, hint: stats.averageRating == null ? "Без оцінок" : `Середня ${stats.averageRating.toFixed(1)}` },
                                { label: "Підписки", value: stats.subscriptions },
                                { label: "Коментарі", value: stats.comments },
                                { label: "У плейлистах", value: stats.playlistAdds },
                                { label: "Серії", value: stats.episodes, hint: `${stats.variants} варіантів · ${stats.activeVariants} активних` },
                                { label: "Коди", value: stats.codes },
                            ]}
                        />
                    )}

                    <EditorSideCard
                        title="Статус"
                        reset={fieldReset("status", "статус")}
                    >
                        <Select
                            value={status}
                            options={animeStatusOptions}
                            onChange={(value) =>
                                setValue("status", value, {
                                    shouldDirty: true,
                                })
                            }
                            className="w-full"
                        />
                    </EditorSideCard>

                    <EditorSideCard
                        title="Віковий рейтинг"
                        reset={fieldReset("rating", "віковий рейтинг")}
                    >
                        <Select
                            value={rating}
                            options={ratingOptions}
                            onChange={(value) =>
                                setValue("rating", value, {
                                    shouldDirty: true,
                                })
                            }
                            className="w-full"
                        />
                    </EditorSideCard>

                    <EditorSideCard
                        title="Постер"
                        reset={fieldReset("poster", "постер")}
                    >
                        <PosterPicker
                            value={poster}
                            initialPoster={anime?.poster ?? null}
                            onChange={(value) =>
                                setValue("poster", value, {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                })
                            }
                        />
                    </EditorSideCard>

                    <EditorSideCard
                        title="Додаткові зображення"
                        reset={fieldReset(
                            "additionalImages",
                            "додаткові зображення",
                        )}
                    >
                        <AdditionalImagesPicker
                            value={additionalImages}
                            initialImages={anime?.additionalImages ?? []}
                            onChange={(value) =>
                                setValue("additionalImages", value, {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                })
                            }
                        />
                    </EditorSideCard>

                    {anime && (
                        <SystemInfoCard
                            id={anime.id}
                            createdAt={anime.createdAt}
                            updatedAt={anime.updatedAt}
                        />
                    )}
                </div>
            }
        >
            <EditorPanel className="lg:overflow-visible">
                <div className="grid gap-7">
                    <EditorSection title="Назва">
                        <div className="grid gap-3 lg:grid-cols-3">
                            <FormField
                                label="Назва"
                                reset={fieldReset("title", "назву")}
                                error={errors.title?.message}
                            >
                                <Input
                                    {...register("title", {
                                        required: "Вкажіть назву аніме.",
                                        validate: (value) =>
                                            value.trim().length > 0 ||
                                            "Вкажіть назву аніме.",
                                    })}
                                    autoFocus={!anime}
                                    placeholder="Українська назва"
                                />
                            </FormField>
                            <FormField
                                label="Ромадзі"
                                reset={fieldReset(
                                    "originalTitle",
                                    "назву ромадзі",
                                )}
                            >
                                <Input
                                    {...register("originalTitle")}
                                    placeholder="Romaji"
                                />
                            </FormField>
                            <FormField
                                label="Англійська назва"
                                reset={fieldReset(
                                    "engTitle",
                                    "англійську назву",
                                )}
                            >
                                <Input
                                    {...register("engTitle")}
                                    placeholder="English title"
                                />
                            </FormField>
                        </div>
                    </EditorSection>

                    <EditorSection
                        title="Опис"
                        reset={fieldReset("description", "опис")}
                    >
                        <textarea
                            {...register("description")}
                            rows={5}
                            placeholder="Короткий опис аніме"
                            className="min-h-28 w-full resize-y rounded-lg border border-white/[0.035] bg-[#171d22] px-4 py-3 text-[15px] leading-6 text-white/90 outline-none transition placeholder:text-white/30 focus:border-white/14 focus:bg-[#1a2026]"
                        />
                    </EditorSection>

                    <EditorSection title="Тип та нумерація" reset={typeReset}>
                        <div
                            className={cn(
                                "grid gap-3 sm:grid-cols-2",
                                type === AnimeType.TV && "xl:grid-cols-4",
                            )}
                        >
                            <FormField label="Тип">
                                <Select
                                    value={type}
                                    options={animeTypeOptions}
                                    onChange={handleTypeChange}
                                    className="w-full"
                                />
                            </FormField>
                            {type === AnimeType.TV && (
                                <>
                                    <FormField
                                        label="Кількість епізодів"
                                        reset={fieldReset(
                                            "episodesTotal",
                                            "кількість епізодів",
                                        )}
                                    >
                                        <Input
                                            {...register("episodesTotal")}
                                            type="number"
                                            min={0}
                                            placeholder="12"
                                        />
                                    </FormField>
                                    <FormField
                                        label="Номер сезону"
                                        reset={fieldReset(
                                            "seasonNumber",
                                            "номер сезону",
                                        )}
                                    >
                                        <Input
                                            {...register("seasonNumber")}
                                            type="number"
                                            min={0}
                                            placeholder="1"
                                        />
                                    </FormField>
                                    <FormField
                                        label="Номер частини"
                                        reset={fieldReset(
                                            "partNumber",
                                            "номер частини",
                                        )}
                                    >
                                        <Input
                                            {...register("partNumber")}
                                            type="number"
                                            min={0}
                                            placeholder="1"
                                        />
                                    </FormField>
                                </>
                            )}
                            {type === AnimeType.MOVIE && (
                                <FormField
                                    label="Номер частини"
                                    reset={fieldReset(
                                        "partNumber",
                                        "номер частини",
                                    )}
                                >
                                    <Input
                                        {...register("partNumber")}
                                        type="number"
                                        min={0}
                                        placeholder="1"
                                    />
                                </FormField>
                            )}
                        </div>
                    </EditorSection>

                    <EditorSection title="Дати">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <FormField
                                label="Премʼєра"
                                reset={fieldReset(
                                    "releaseDate",
                                    "дату премʼєри",
                                )}
                            >
                                <Input
                                    type="date"
                                    {...register("releaseDate")}
                                />
                            </FormField>
                            <FormField
                                label="Завершення"
                                reset={fieldReset(
                                    "endDate",
                                    "дату завершення",
                                )}
                            >
                                <Input type="date" {...register("endDate")} />
                            </FormField>
                        </div>
                    </EditorSection>

                    <EditorSection
                        title="Жанри"
                        reset={fieldReset("genres", "жанри")}
                    >
                        <GenrePicker
                            value={genres}
                            options={genreOptions}
                            onChange={(value) =>
                                setValue("genres", value, {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                })
                            }
                        />
                    </EditorSection>

                    <EditorSection
                        title="Продюсери"
                        reset={fieldReset("producers", "продюсерів")}
                    >
                        <ProducerPicker
                            value={producers}
                            options={producerOptions}
                            onChange={(value) =>
                                setValue("producers", value, {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                })
                            }
                        />
                    </EditorSection>

                    <EditorSection title="Додатково">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            <FormField
                                label="Країна"
                                reset={fieldReset("country", "країну")}
                            >
                                <Input
                                    {...register("country")}
                                    placeholder="Японія"
                                />
                            </FormField>
                            <FormField
                                label="Тривалість, хв"
                                reset={fieldReset(
                                    "duration",
                                    "тривалість",
                                )}
                            >
                                <Input
                                    {...register("duration")}
                                    type="number"
                                    min={0}
                                    placeholder="24"
                                />
                            </FormField>
                            <FormField
                                label="Студія"
                                reset={fieldReset("studio", "студію")}
                            >
                                <Input
                                    {...register("studio")}
                                    placeholder="A-1 Pictures"
                                />
                            </FormField>
                        </div>
                    </EditorSection>

                    <EditorSection title="Лінки">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <FormField
                                label="MyAnimeList"
                                reset={fieldReset("mal", "MyAnimeList URL")}
                            >
                                <Input
                                    {...register("mal")}
                                    placeholder="https://myanimelist.net/anime/..."
                                />
                            </FormField>
                            <FormField
                                label="AniList"
                                reset={fieldReset("al", "AniList URL")}
                            >
                                <Input
                                    {...register("al")}
                                    placeholder="https://anilist.co/anime/..."
                                />
                            </FormField>
                        </div>
                    </EditorSection>

                    <EditorSection
                        title="Повʼязане"
                        reset={fieldReset(
                            "relatedAnimeId",
                            "звʼязок з аніме",
                        )}
                    >
                        <RelatedAnimePicker
                            initialItems={anime?.relatedAnimes ?? []}
                            currentAnimeId={anime?.id}
                            value={relatedAnimeId}
                            onChange={(value) =>
                                setValue("relatedAnimeId", value, {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                })
                            }
                        />
                    </EditorSection>
                </div>
            </EditorPanel>
        </EditorBody>
    );
}
