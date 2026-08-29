"use client";

import {
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import AdditionalImagesPicker from "@/components/ui/admin/animes/additional-images-picker";
import GenrePicker from "@/components/ui/admin/animes/genre-picker";
import ProducerPicker from "@/components/ui/admin/animes/producer-picker";
import RelatedAnimePicker from "@/components/ui/admin/animes/related-anime-picker";
import PosterPicker from "@/components/ui/admin/genres/poster-picker";
import {
    EditorBody,
    EditorError,
    EditorHeader,
    EditorPanel,
    SystemInfoCard,
} from "@/components/ui/admin/shared/editor-layout";
import { FormField } from "@/components/ui/admin/shared/form-field";
import { Button } from "@/components/ui/buttons/button";
import { Select, type SelectOption } from "@/components/ui/dropdowns/select";
import { Input } from "@/components/ui/inputs/input";
import {
    useCreateAnimeMutation,
    useUpdateAnimeMutation,
} from "@/lib/store/animi/anime-endpoints";
import { useGetDubTeamsQuery } from "@/lib/store/animi/dub-team-endpoints";
import {
    useGetAnimeEpisodesForEditorQuery,
    useReplaceAnimeEpisodesMutation,
} from "@/lib/store/animi/episode-endpoints";
import { useGetGenresQuery } from "@/lib/store/animi/genre-endpoints";
import { useGetPlayersQuery } from "@/lib/store/animi/player-endpoints";
import { useGetProducersQuery } from "@/lib/store/animi/producer-endpoints";
import {
    AnimeRating,
    AnimeStatus,
    AnimeType,
    DubType,
    EpisodeSourceType,
    type Anime,
    type AnimeEpisode,
    type AnimeEpisodePayload,
    type AnimePayload,
    type EpisodeVariantPayload,
} from "@/lib/types/entites/anime";
import cn from "@/lib/utils/cn";
import {
    animeRatingOptions,
    animeStatusOptions,
    animeTypeOptions,
    dubTypeOptions,
    episodeSourceOptions,
} from "./anime-options";

type EditorTab = "main" | "episodes";
type RatingValue = AnimeRating | "";

type EpisodeVariantForm = {
    sourceType: EpisodeSourceType;
    endpoint: string;
    dubType: DubType;
    dubTeamId: string;
    playerId: string;
    isActive: boolean;
};

type EpisodeForm = {
    key: string;
    number: string;
    title: string;
    variants: EpisodeVariantForm[];
};

type AnimeFormValues = {
    title: string;
    originalTitle: string;
    engTitle: string;
    description: string;
    type: AnimeType;
    status: AnimeStatus;
    rating: RatingValue;
    poster: string | number | null;
    additionalImages: (string | number | null)[];
    genres: string[];
    producers: string[];
    relatedAnimeId: number | null;
    releaseDate: string;
    endDate: string;
    episodesTotal: string;
    seasonNumber: string;
    partNumber: string;
    duration: string;
    country: string;
    studio: string;
    mal: string;
    al: string;
};

const ratingOptions: SelectOption<RatingValue>[] = [
    { value: "", label: "Не вказано" },
    ...animeRatingOptions,
];

export default function AnimeEditor({ anime }: { anime: Anime | null }) {
    const router = useRouter();
    const episodeKeyCounter = useRef(0);
    const [activeTab, setActiveTab] = useState<EditorTab>("main");
    const [activeEpisodeIndex, setActiveEpisodeIndex] = useState(0);
    const [episodes, setEpisodes] = useState<EpisodeForm[]>([]);
    const [episodesDirty, setEpisodesDirty] = useState(false);
    const [episodesInitialized, setEpisodesInitialized] = useState(!anime);
    const [localError, setLocalError] = useState<string | null>(null);
    const [persistedAnimeId, setPersistedAnimeId] = useState<number | null>(
        anime?.id ?? null,
    );

    const [createAnime, createState] = useCreateAnimeMutation();
    const [updateAnime, updateState] = useUpdateAnimeMutation();
    const [replaceEpisodes, replaceEpisodesState] =
        useReplaceAnimeEpisodesMutation();

    const { data: genreData } = useGetGenresQuery({ page: 1, limit: 100 });
    const { data: producerData } = useGetProducersQuery({ page: 1, limit: 100 });
    const { data: playerData } = useGetPlayersQuery({ page: 1, limit: 100 });
    const { data: dubTeamData } = useGetDubTeamsQuery({ page: 1, limit: 100 });
    const episodesQuery = useGetAnimeEpisodesForEditorQuery(anime?.id ?? 0, {
        skip: !anime || activeTab !== "episodes",
    });

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, dirtyFields },
    } = useForm<AnimeFormValues>({
        defaultValues: toFormValues(anime),
    });

    const type = watch("type");
    const status = watch("status");
    const rating = watch("rating");
    const poster = watch("poster");
    const additionalImages = watch("additionalImages");
    const genres = watch("genres");
    const producers = watch("producers");

    useEffect(() => {
        if (!anime || !episodesQuery.data || episodesDirty || episodesInitialized) {
            return;
        }

        setEpisodes(toEpisodeForms(episodesQuery.data));
        setActiveEpisodeIndex(0);
        setEpisodesInitialized(true);
    }, [anime, episodesDirty, episodesInitialized, episodesQuery.data]);

    const genreOptions = useMemo(
        () => mergeNameOptions(genreData?.items ?? [], anime?.genres ?? []),
        [anime?.genres, genreData?.items],
    );
    const producerOptions = useMemo(
        () => mergeNameOptions(producerData?.items ?? [], anime?.producers ?? []),
        [anime?.producers, producerData?.items],
    );

    const playerOptions = useMemo<SelectOption<string>[]>(
        () =>
            playerData?.items.map((player) => ({
                value: String(player.id),
                label: player.title,
            })) ?? [],
        [playerData?.items],
    );
    const dubTeamOptions = useMemo<SelectOption<string>[]>(
        () =>
            dubTeamData?.items.map((team) => ({
                value: String(team.id),
                label: team.title,
            })) ?? [],
        [dubTeamData?.items],
    );

    const sortedEpisodeIndexes = useMemo(
        () =>
            episodes
                .map((episode, index) => ({
                    index,
                    number: Number(episode.number),
                }))
                .sort((a, b) => {
                    const aNumber = Number.isFinite(a.number)
                        ? a.number
                        : Number.MAX_SAFE_INTEGER;
                    const bNumber = Number.isFinite(b.number)
                        ? b.number
                        : Number.MAX_SAFE_INTEGER;
                    return aNumber - bNumber || a.index - b.index;
                })
                .map(({ index }) => index),
        [episodes],
    );

    const isSaving =
        createState.isLoading ||
        updateState.isLoading ||
        replaceEpisodesState.isLoading;
    const mutationError =
        createState.error ?? updateState.error ?? replaceEpisodesState.error;

    const submit = handleSubmit(
        async (values) => {
            setLocalError(null);
            const animePayload = buildAnimePayload(values);
            const episodePayload = buildEpisodePayload(episodes);

            if (typeof episodePayload === "string") {
                setLocalError(episodePayload);
                setActiveTab("episodes");
                return;
            }

            try {
                let animeId = persistedAnimeId;

                if (animeId) {
                    const body = anime
                        ? buildUpdatePayload(animePayload, dirtyFields)
                        : animePayload;
                    if (Object.keys(body).length > 0) {
                        await updateAnime({ id: animeId, body }).unwrap();
                    }
                } else {
                    const created = await createAnime(animePayload).unwrap();
                    animeId = created.id;
                    setPersistedAnimeId(created.id);
                }

                if (animeId && (episodesDirty || (!anime && episodes.length > 0))) {
                    await replaceEpisodes({
                        animeId,
                        episodes: episodePayload,
                    }).unwrap();
                    setEpisodesDirty(false);
                }

                router.push("/admin/animes");
            } catch {
                // Mutation errors are rendered below the header. If the anime was
                // already created, persistedAnimeId prevents a duplicate on retry.
            }
        },
        () => setActiveTab("main"),
    );

    function handleTypeChange(nextType: AnimeType) {
        setValue("type", nextType, { shouldDirty: true });

        if (nextType === AnimeType.TV) {
            return;
        }
        if (nextType === AnimeType.MOVIE) {
            setValue("episodesTotal", "", { shouldDirty: true });
            setValue("seasonNumber", "", { shouldDirty: true });
            return;
        }

        setValue("episodesTotal", "", { shouldDirty: true });
        setValue("seasonNumber", "", { shouldDirty: true });
        setValue("partNumber", "", { shouldDirty: true });
    }

    function markEpisodes(nextEpisodes: EpisodeForm[]) {
        setEpisodes(nextEpisodes);
        setEpisodesDirty(true);
        setLocalError(null);
    }

    function addEpisode() {
        const usedNumbers = new Set(
            episodes
                .map((episode) => Number(episode.number))
                .filter((number) => Number.isInteger(number) && number > 0),
        );
        let nextNumber = 1;
        while (usedNumbers.has(nextNumber)) nextNumber++;

        const nextEpisode: EpisodeForm = {
            key: `new-${++episodeKeyCounter.current}`,
            number: String(nextNumber),
            title: "",
            variants: [],
        };
        markEpisodes([...episodes, nextEpisode]);
        setActiveEpisodeIndex(episodes.length);
        setActiveTab("episodes");
    }

    function removeEpisode(index: number) {
        const next = episodes.filter((_, episodeIndex) => episodeIndex !== index);
        markEpisodes(next);
        if (next.length === 0) {
            setActiveEpisodeIndex(0);
            return;
        }
        setActiveEpisodeIndex(Math.min(index, next.length - 1));
    }

    function updateEpisode<K extends keyof Omit<EpisodeForm, "key">>(
        index: number,
        key: K,
        value: EpisodeForm[K],
    ) {
        if (key === "number") {
            const nextNumber = Number(value);
            if (
                String(value).trim() &&
                Number.isInteger(nextNumber) &&
                episodes.some(
                    (episode, episodeIndex) =>
                        episodeIndex !== index && Number(episode.number) === nextNumber,
                )
            ) {
                setLocalError(`Серія №${nextNumber} вже існує.`);
                return;
            }
        }

        markEpisodes(
            episodes.map((episode, episodeIndex) =>
                episodeIndex === index ? { ...episode, [key]: value } : episode,
            ),
        );
    }

    function addVariant(episodeIndex: number) {
        const current = episodes[episodeIndex]?.variants ?? [];
        updateEpisode(episodeIndex, "variants", [
            ...current,
            {
                sourceType: EpisodeSourceType.IFRAME,
                endpoint: "",
                dubType: DubType.DUB,
                dubTeamId: dubTeamOptions[0]?.value ?? "",
                playerId: playerOptions[0]?.value ?? "",
                isActive: current.length === 0,
            },
        ]);
    }

    function updateVariant(
        episodeIndex: number,
        variantIndex: number,
        patch: Partial<EpisodeVariantForm>,
    ) {
        const current = episodes[episodeIndex]?.variants ?? [];
        updateEpisode(
            episodeIndex,
            "variants",
            current.map((variant, index) =>
                index === variantIndex ? { ...variant, ...patch } : variant,
            ),
        );
    }

    function removeVariant(episodeIndex: number, variantIndex: number) {
        const current = episodes[episodeIndex]?.variants ?? [];
        updateEpisode(
            episodeIndex,
            "variants",
            current.filter((_, index) => index !== variantIndex),
        );
    }

    return (
        <form
            onSubmit={submit}
            className="flex min-h-full min-w-0 flex-1 flex-col lg:h-full lg:min-h-0"
        >
            <EditorHeader
                backHref="/admin/animes"
                backLabel="Назад до аніме"
                title={anime ? "Редагування аніме" : "Створення аніме"}
                subtitle={anime ? `${anime.title} · #${anime.id}` : undefined}
                isSaving={isSaving}
                submitLabel={anime ? "Зберегти" : "Створити"}
            />

            <div className="mt-2 flex shrink-0 items-center gap-1 border-b border-white/[0.05] px-0.5">
                <TabButton
                    active={activeTab === "main"}
                    onClick={() => setActiveTab("main")}
                >
                    Основна інформація
                </TabButton>
                <TabButton
                    active={activeTab === "episodes"}
                    onClick={() => setActiveTab("episodes")}
                >
                    Серії
                    {(episodesInitialized ? episodes.length : anime?._count.episodes ?? 0) > 0 && (
                        <span className="ml-1 rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[11px]">
                            {episodesInitialized ? episodes.length : anime?._count.episodes ?? 0}
                        </span>
                    )}
                </TabButton>
            </div>

            <EditorError error={mutationError} />
            {localError && (
                <div className="mt-3 shrink-0 rounded-lg border border-red-400/15 bg-red-500/[0.07] px-4 py-3 text-[14px] text-red-200/90">
                    {localError}
                </div>
            )}

            {activeTab === "main" ? (
                <EditorBody
                    unifiedScroll
                    sidebar={
                        <div className="grid gap-4">
                            <EditorSideCard title="Статус">
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

                            <EditorSideCard title="Віковий рейтинг">
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

                            <EditorSideCard title="Постер">
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

                            <EditorSideCard title="Додаткові зображення">
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
                            <Section title="Назва">
                                <div className="grid gap-2 lg:grid-cols-3">
                                    <div className="grid gap-1.5">
                                        <Input
                                            {...register("title", {
                                                required: "Вкажіть назву аніме.",
                                                validate: (value) =>
                                                    value.trim().length > 0 ||
                                                    "Вкажіть назву аніме.",
                                            })}
                                            autoFocus={!anime}
                                            placeholder="Назва"
                                        />
                                        {errors.title?.message && (
                                            <span className="text-[12px] text-red-300/85">
                                                {errors.title.message}
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        {...register("originalTitle")}
                                        placeholder="Оригінальна назва"
                                    />
                                    <Input
                                        {...register("engTitle")}
                                        placeholder="Англійська назва"
                                    />
                                </div>
                            </Section>

                            <Section title="Опис">
                                <textarea
                                    {...register("description")}
                                    rows={5}
                                    placeholder="Короткий опис аніме"
                                    className="min-h-28 w-full resize-y rounded-lg border border-white/[0.035] bg-[#171d22] px-4 py-3 text-[15px] leading-6 text-white/90 outline-none transition placeholder:text-white/30 focus:border-white/14 focus:bg-[#1a2026]"
                                />
                            </Section>

                            <Section title="Тип та нумерація">
                                <div
                                    className={cn(
                                        "grid gap-2 sm:grid-cols-2",
                                        type === AnimeType.TV && "xl:grid-cols-4",
                                    )}
                                >
                                    <Select
                                        label="Тип"
                                        value={type}
                                        options={animeTypeOptions}
                                        onChange={handleTypeChange}
                                        className="w-full"
                                    />
                                    {type === AnimeType.TV && (
                                        <>
                                            <Input
                                                {...register("episodesTotal")}
                                                type="number"
                                                min={0}
                                                placeholder="Кількість епізодів"
                                            />
                                            <Input
                                                {...register("seasonNumber")}
                                                type="number"
                                                min={0}
                                                placeholder="Номер сезону"
                                            />
                                            <Input
                                                {...register("partNumber")}
                                                type="number"
                                                min={0}
                                                placeholder="Номер частини"
                                            />
                                        </>
                                    )}
                                    {type === AnimeType.MOVIE && (
                                        <Input
                                            {...register("partNumber")}
                                            type="number"
                                            min={0}
                                            placeholder="Номер частини"
                                        />
                                    )}
                                </div>
                            </Section>

                            <Section title="Дати">
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <FormField label="Премʼєра">
                                        <Input type="date" {...register("releaseDate")} />
                                    </FormField>
                                    <FormField label="Завершення">
                                        <Input type="date" {...register("endDate")} />
                                    </FormField>
                                </div>
                            </Section>

                            <Section title="Жанри">
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
                            </Section>

                            <Section title="Продюсери">
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
                            </Section>

                            <Section title="Додатково">
                                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                    <Input {...register("country")} placeholder="Країна" />
                                    <Input
                                        {...register("duration")}
                                        type="number"
                                        min={0}
                                        placeholder="Тривалість, хв"
                                    />
                                    <Input {...register("studio")} placeholder="Студія" />
                                </div>
                            </Section>

                            <Section title="Лінки">
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <Input {...register("mal")} placeholder="MyAnimeList URL" />
                                    <Input {...register("al")} placeholder="AniList URL" />
                                </div>
                            </Section>

                            <Section title="Повʼязане">
                                <RelatedAnimePicker
                                    initialItems={anime?.relatedAnimes ?? []}
                                    currentAnimeId={anime?.id}
                                    onChange={(value) =>
                                        setValue("relatedAnimeId", value, {
                                            shouldDirty: true,
                                            shouldTouch: true,
                                        })
                                    }
                                />
                            </Section>
                        </div>
                    </EditorPanel>
                </EditorBody>
            ) : (
                <div className="mt-3 grid min-h-[520px] flex-1 gap-4 lg:min-h-0 lg:grid-cols-[300px_minmax(0,1fr)]">
                    <section className="flex min-h-0 flex-col rounded-xl border border-white/[0.025] bg-[#11171c] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.12)] sm:p-4">
                        <Button
                            type="button"
                            color="green"
                            onClick={addEpisode}
                            className="w-full"
                            disabled={Boolean(anime && !episodesInitialized)}
                        >
                            <Plus size={17} />
                            Додати серію
                        </Button>
                        <div className="mt-3 grid grid-cols-[70px_1fr_54px] rounded-md bg-[#939799] px-3 py-2 text-[12px] text-white/90">
                            <span>Номер</span>
                            <span>Назва</span>
                            <span className="text-center">Вар.</span>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto">
                            {anime && episodesQuery.isLoading && !episodesInitialized ? (
                                <div className="flex h-44 items-center justify-center px-3 text-center text-[13px] text-white/32">
                                    Завантаження серій...
                                </div>
                            ) : episodes.length === 0 ? (
                                <div className="flex h-44 flex-col items-center justify-center px-3 text-center text-[13px] text-white/32">
                                    Серій ще немає.
                                    <span className="mt-1 text-white/22">
                                        Додайте першу серію кнопкою вище.
                                    </span>
                                </div>
                            ) : (
                                sortedEpisodeIndexes.map((episodeIndex) => {
                                    const episode = episodes[episodeIndex];
                                    return (
                                        <button
                                            key={episode.key}
                                            type="button"
                                            onClick={() => setActiveEpisodeIndex(episodeIndex)}
                                            className={cn(
                                                "grid w-full grid-cols-[70px_1fr_54px] items-center border-b border-white/[0.07] px-3 py-3 text-left text-[13px] transition",
                                                activeEpisodeIndex === episodeIndex
                                                    ? "bg-white/[0.055] text-white/88"
                                                    : "text-white/58 hover:bg-white/[0.025]",
                                            )}
                                        >
                                            <span>#{episode.number || "—"}</span>
                                            <span className="truncate pr-2">
                                                {episode.title.trim() ||
                                                    `Серія ${episode.number || episodeIndex + 1}`}
                                            </span>
                                            <span className="text-center text-white/45">
                                                {episode.variants.length}
                                            </span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    <section className="min-h-0 overflow-y-auto rounded-xl border border-white/[0.025] bg-[#11171c] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.12)] sm:p-6">
                        {anime && episodesQuery.error && !episodesInitialized ? (
                            <div className="flex min-h-[360px] items-center justify-center px-6 text-center text-[13px] text-red-300/75">
                                Не вдалося завантажити серії. Спробуйте відкрити вкладку ще раз.
                            </div>
                        ) : episodes.length === 0 ? (
                            <div className="flex min-h-[360px] flex-col items-center justify-center text-center text-white/32">
                                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-white/[0.04]">
                                    <Plus size={20} />
                                </div>
                                Оберіть або додайте серію для редагування.
                            </div>
                        ) : (
                            <EpisodeEditor
                                episode={episodes[Math.min(activeEpisodeIndex, episodes.length - 1)]}
                                episodeIndex={Math.min(activeEpisodeIndex, episodes.length - 1)}
                                playerOptions={playerOptions}
                                dubTeamOptions={dubTeamOptions}
                                onEpisodeChange={updateEpisode}
                                onAddVariant={addVariant}
                                onVariantChange={updateVariant}
                                onRemoveVariant={removeVariant}
                                onRemoveEpisode={removeEpisode}
                            />
                        )}
                    </section>
                </div>
            )}
        </form>
    );
}

function EpisodeEditor({
    episode,
    episodeIndex,
    playerOptions,
    dubTeamOptions,
    onEpisodeChange,
    onAddVariant,
    onVariantChange,
    onRemoveVariant,
    onRemoveEpisode,
}: {
    episode: EpisodeForm;
    episodeIndex: number;
    playerOptions: SelectOption<string>[];
    dubTeamOptions: SelectOption<string>[];
    onEpisodeChange: <K extends keyof Omit<EpisodeForm, "key">>(
        index: number,
        key: K,
        value: EpisodeForm[K],
    ) => void;
    onAddVariant: (episodeIndex: number) => void;
    onVariantChange: (
        episodeIndex: number,
        variantIndex: number,
        patch: Partial<EpisodeVariantForm>,
    ) => void;
    onRemoveVariant: (episodeIndex: number, variantIndex: number) => void;
    onRemoveEpisode: (episodeIndex: number) => void;
}) {
    return (
        <div>
            <div className="flex flex-col gap-3 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-[13px] text-white/35">Серія</p>
                    <h2 className="mt-0.5 text-[21px] text-white/90">
                        {episode.number || "—"}
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={() => onRemoveEpisode(episodeIndex)}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-400/15 bg-red-500/[0.06] px-3 text-[13px] text-red-300/75 transition hover:bg-red-500/[0.11] hover:text-red-200"
                >
                    <Trash2 size={15} />
                    Видалити серію
                </button>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-[130px_minmax(0,1fr)]">
                <Input
                    type="number"
                    min={1}
                    value={episode.number}
                    onChange={(event) =>
                        onEpisodeChange(episodeIndex, "number", event.target.value)
                    }
                    placeholder="Номер"
                />
                <Input
                    value={episode.title}
                    onChange={(event) =>
                        onEpisodeChange(episodeIndex, "title", event.target.value)
                    }
                    placeholder="Назва серії (необовʼязково)"
                />
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-[16px] text-white/82">Варіанти</h3>
                    <p className="mt-0.5 text-[13px] text-white/32">
                        Озвучка/субтитри, плеєр та джерело відтворення.
                    </p>
                </div>
                <Button
                    type="button"
                    color="green"
                    onClick={() => onAddVariant(episodeIndex)}
                >
                    <Plus size={16} />
                    Додати варіант
                </Button>
            </div>

            <div className="mt-3 grid gap-2">
                {episode.variants.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-white/[0.09] px-4 py-8 text-center text-[13px] text-white/30">
                        У цієї серії поки немає варіантів відтворення.
                    </div>
                ) : (
                    episode.variants.map((variant, variantIndex) => (
                        <div
                            key={variantIndex}
                            className="rounded-xl border border-[#365064] bg-[#0f151a] p-3 sm:p-4"
                        >
                            <div className="grid gap-2 lg:grid-cols-2 xl:grid-cols-[190px_minmax(0,1fr)_190px]">
                                <Select
                                    label="Тип"
                                    value={variant.dubType}
                                    options={dubTypeOptions}
                                    onChange={(value) =>
                                        onVariantChange(episodeIndex, variantIndex, {
                                            dubType: value,
                                        })
                                    }
                                    className="w-full"
                                />
                                <Select
                                    label="Команда"
                                    value={variant.dubTeamId}
                                    options={dubTeamOptions}
                                    onChange={(value) =>
                                        onVariantChange(episodeIndex, variantIndex, {
                                            dubTeamId: value,
                                        })
                                    }
                                    placeholder="Оберіть команду"
                                    className="w-full"
                                    dropdownClassName="max-h-64 overflow-y-auto"
                                />
                                <Select
                                    label="Плеєр"
                                    value={variant.playerId}
                                    options={playerOptions}
                                    onChange={(value) =>
                                        onVariantChange(episodeIndex, variantIndex, {
                                            playerId: value,
                                        })
                                    }
                                    placeholder="Оберіть плеєр"
                                    className="w-full"
                                    dropdownClassName="max-h-64 overflow-y-auto"
                                />
                                <Select
                                    label="Джерело"
                                    value={variant.sourceType}
                                    options={episodeSourceOptions}
                                    onChange={(value) =>
                                        onVariantChange(episodeIndex, variantIndex, {
                                            sourceType: value,
                                        })
                                    }
                                    className="w-full"
                                />
                                <Input
                                    value={variant.endpoint}
                                    onChange={(event) =>
                                        onVariantChange(episodeIndex, variantIndex, {
                                            endpoint: event.target.value,
                                        })
                                    }
                                    placeholder="Посилання / endpoint"
                                    wrapperClassName="lg:col-span-1 xl:col-span-2"
                                />
                            </div>

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.05] pt-3">
                                <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-white/52">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onVariantChange(episodeIndex, variantIndex, {
                                                isActive: !variant.isActive,
                                            })
                                        }
                                        className={cn(
                                            "flex size-5 items-center justify-center rounded border transition",
                                            variant.isActive
                                                ? "border-(--green) bg-(--green) text-white"
                                                : "border-white/15 bg-white/[0.025] text-transparent",
                                        )}
                                        aria-pressed={variant.isActive}
                                    >
                                        <Check size={13} strokeWidth={2.5} />
                                    </button>
                                    Активний варіант
                                </label>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onRemoveVariant(episodeIndex, variantIndex)
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] text-red-300/55 transition hover:bg-red-500/[0.07] hover:text-red-200"
                                >
                                    <Trash2 size={14} />
                                    Видалити варіант
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section>
            <h2 className="mb-3 text-[16px] font-medium text-white/82">{title}</h2>
            {children}
        </section>
    );
}

function EditorSideCard({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-xl border border-white/[0.025] bg-[#11171c] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.12)]">
            <h2 className="mb-3 text-[16px] font-medium text-white/86">{title}</h2>
            {children}
        </section>
    );
}

function TabButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "relative inline-flex min-h-10 items-center px-3 text-[14px] transition",
                active ? "text-white/88" : "text-white/42 hover:text-white/70",
            )}
        >
            {children}
            <span
                className={cn(
                    "absolute inset-x-2 bottom-0 h-0.5 rounded-full transition",
                    active ? "bg-(--primary)" : "bg-transparent",
                )}
            />
        </button>
    );
}

function toFormValues(anime: Anime | null): AnimeFormValues {
    return {
        title: anime?.title ?? "",
        originalTitle: anime?.originalTitle ?? "",
        engTitle: anime?.engTitle ?? "",
        description: anime?.description ?? "",
        type: anime?.type ?? AnimeType.TV,
        status: anime?.status ?? AnimeStatus.DRAFT,
        rating: anime?.rating ?? "",
        poster: anime?.poster?.id ?? null,
        additionalImages: anime?.additionalImages.map((image) => image.id) ?? [],
        genres: anime?.genres.map((genre) => genre.title) ?? [],
        producers: anime?.producers.map((producer) => producer.title) ?? [],
        relatedAnimeId: anime?.relatedAnimes[0]?.id ?? null,
        releaseDate: toDateInput(anime?.releaseDate),
        endDate: toDateInput(anime?.endDate),
        episodesTotal: numberToInput(anime?.episodesTotal),
        seasonNumber: numberToInput(anime?.seasonNumber),
        partNumber: numberToInput(anime?.partNumber),
        duration: numberToInput(anime?.duration),
        country: anime?.country ?? "",
        studio: anime?.studio ?? "",
        mal: anime?.mal ?? "",
        al: anime?.al ?? "",
    };
}

function toEpisodeForms(episodes: AnimeEpisode[]): EpisodeForm[] {
    return episodes
        .map((episode) => ({
            key: `episode-${episode.id}`,
            number: String(episode.number),
            title: episode.title ?? "",
            variants: episode.variants.map((variant) => ({
                sourceType: variant.sourceType,
                endpoint: variant.endpoint,
                dubType: variant.dubType,
                dubTeamId: String(variant.dubTeam.id),
                playerId: String(variant.player.id),
                isActive: variant.isActive,
            })),
        }))
        .sort((a, b) => Number(a.number) - Number(b.number));
}

function buildAnimePayload(values: AnimeFormValues): AnimePayload {
    const typeNumbers = getTypeNumberPayload(values);

    return {
        title: values.title.trim(),
        originalTitle: nullableString(values.originalTitle),
        engTitle: nullableString(values.engTitle),
        description: nullableString(values.description),
        type: values.type,
        status: values.status,
        rating: values.rating || null,
        poster: values.poster,
        additionalImages: values.additionalImages,
        genres: values.genres,
        producers: values.producers,
        relatedAnimeId: values.relatedAnimeId,
        releaseDate: nullableString(values.releaseDate),
        endDate: nullableString(values.endDate),
        ...typeNumbers,
        duration: nullableNumber(values.duration),
        country: nullableString(values.country),
        studio: nullableString(values.studio),
        mal: nullableString(values.mal),
        al: nullableString(values.al),
    };
}

function buildEpisodePayload(episodes: EpisodeForm[]): AnimeEpisodePayload[] | string {
    const result: AnimeEpisodePayload[] = [];
    const episodeNumbers = new Set<number>();

    for (const [episodeIndex, episode] of episodes.entries()) {
        const number = Number(episode.number);
        if (!Number.isInteger(number) || number < 1) {
            return `Серія ${episodeIndex + 1}: вкажіть коректний номер.`;
        }
        if (episodeNumbers.has(number)) {
            return `Серія №${number} додана більше одного разу.`;
        }
        episodeNumbers.add(number);

        const variants: EpisodeVariantPayload[] = [];
        const variantKeys = new Set<string>();
        for (const [variantIndex, variant] of episode.variants.entries()) {
            const dubTeamId = Number(variant.dubTeamId);
            const playerId = Number(variant.playerId);

            if (!variant.endpoint.trim()) {
                return `Серія №${number}, варіант ${variantIndex + 1}: вкажіть посилання або endpoint.`;
            }
            if (!Number.isInteger(dubTeamId) || dubTeamId < 1) {
                return `Серія №${number}, варіант ${variantIndex + 1}: оберіть команду озвучення.`;
            }
            if (!Number.isInteger(playerId) || playerId < 1) {
                return `Серія №${number}, варіант ${variantIndex + 1}: оберіть плеєр.`;
            }

            const variantKey = `${variant.dubType}:${dubTeamId}:${playerId}`;
            if (variantKeys.has(variantKey)) {
                return `Серія №${number}: однаковий варіант озвучення/плеєра додано двічі.`;
            }
            variantKeys.add(variantKey);

            variants.push({
                sourceType: variant.sourceType,
                endpoint: variant.endpoint.trim(),
                dubType: variant.dubType,
                dubTeamId,
                playerId,
                isActive: variant.isActive,
            });
        }

        result.push({
            number,
            title: nullableString(episode.title) ?? undefined,
            variants,
        });
    }

    return result.sort((a, b) => a.number - b.number);
}

function buildUpdatePayload(
    payload: AnimePayload,
    dirtyFields: Partial<Record<keyof AnimeFormValues, unknown>>,
): Partial<AnimePayload> {
    const body: Partial<AnimePayload> = {};

    if (dirtyFields.title) body.title = payload.title;
    if (dirtyFields.originalTitle) body.originalTitle = payload.originalTitle;
    if (dirtyFields.engTitle) body.engTitle = payload.engTitle;
    if (dirtyFields.description) body.description = payload.description;
    if (dirtyFields.type) body.type = payload.type;
    if (dirtyFields.status) body.status = payload.status;
    if (dirtyFields.rating) body.rating = payload.rating;
    if (dirtyFields.poster) body.poster = payload.poster;
    if (dirtyFields.additionalImages)
        body.additionalImages = payload.additionalImages;
    if (dirtyFields.genres) body.genres = payload.genres;
    if (dirtyFields.producers) body.producers = payload.producers;
    if (dirtyFields.relatedAnimeId)
        body.relatedAnimeId = payload.relatedAnimeId;
    if (dirtyFields.releaseDate) body.releaseDate = payload.releaseDate;
    if (dirtyFields.endDate) body.endDate = payload.endDate;
    if (dirtyFields.episodesTotal || dirtyFields.type)
        body.episodesTotal = payload.episodesTotal;
    if (dirtyFields.seasonNumber || dirtyFields.type)
        body.seasonNumber = payload.seasonNumber;
    if (dirtyFields.partNumber || dirtyFields.type)
        body.partNumber = payload.partNumber;
    if (dirtyFields.duration) body.duration = payload.duration;
    if (dirtyFields.country) body.country = payload.country;
    if (dirtyFields.studio) body.studio = payload.studio;
    if (dirtyFields.mal) body.mal = payload.mal;
    if (dirtyFields.al) body.al = payload.al;

    return body;
}

function getTypeNumberPayload(values: AnimeFormValues) {
    if (values.type === AnimeType.TV) {
        return {
            episodesTotal: nullableNumber(values.episodesTotal),
            seasonNumber: nullableNumber(values.seasonNumber),
            partNumber: nullableNumber(values.partNumber),
        };
    }
    if (values.type === AnimeType.MOVIE) {
        return {
            episodesTotal: null,
            seasonNumber: null,
            partNumber: nullableNumber(values.partNumber),
        };
    }
    return {
        episodesTotal: null,
        seasonNumber: null,
        partNumber: null,
    };
}

function mergeNameOptions<T extends { id: number; title: string }>(
    primary: T[],
    selected: T[],
): T[] {
    const byId = new Map(primary.map((item) => [item.id, item]));
    for (const item of selected) byId.set(item.id, item);
    return [...byId.values()];
}

function nullableString(value: string) {
    const normalized = value.trim();
    return normalized ? normalized : null;
}

function nullableNumber(value: string) {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function numberToInput(value: number | null | undefined) {
    return value == null ? "" : String(value);
}

function toDateInput(value: string | null | undefined) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
}
