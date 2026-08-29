"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Braces, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { EditorTabButton } from "@/components/ui/admin/animes/anime-editor-layout";
import {
    areEpisodeFormsEqual,
    buildAnimePayload,
    buildEpisodePayload,
    buildUpdatePayload,
    cloneEpisodeForm,
    cloneEpisodeForms,
    mergeNameOptions,
    toEpisodeForms,
    toFormValues,
    toImportFormPatch,
    type AnimeFormValues,
    type EpisodeForm,
    type EpisodeVariantForm,
} from "@/components/ui/admin/animes/anime-editor-model";
import AnimeJsonImportModal, {
    type AnimeImportData,
} from "@/components/ui/admin/animes/anime-json-import-modal";
import AnimeMainTab from "@/components/ui/admin/animes/anime-main-tab";
import EpisodeEditor from "@/components/ui/admin/animes/episode-editor";
import { EditorError, EditorHeader } from "@/components/ui/admin/shared/editor-layout";
import FieldResetButton from "@/components/ui/admin/shared/field-reset-button";
import { Button } from "@/components/ui/buttons/button";
import type { SelectOption } from "@/components/ui/dropdowns/select";
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
    AnimeType,
    DubType,
    EpisodeSourceType,
    type Anime,
} from "@/lib/types/entites/anime";
import type { AnimeStats } from "@/lib/types/admin-stats";
import cn from "@/lib/utils/cn";

type EditorTab = "main" | "episodes";

export default function AnimeEditor({ anime, stats }: { anime: Anime | null; stats?: AnimeStats }) {
    const router = useRouter();
    const episodeKeyCounter = useRef(0);
    const variantKeyCounter = useRef(0);
    const [activeTab, setActiveTab] = useState<EditorTab>("main");
    const [activeEpisodeIndex, setActiveEpisodeIndex] = useState(0);
    const [episodes, setEpisodes] = useState<EpisodeForm[]>([]);
    const [initialEpisodes, setInitialEpisodes] = useState<EpisodeForm[]>([]);
    const [initialEpisodesLoaded, setInitialEpisodesLoaded] = useState(!anime);
    const [episodesDirty, setEpisodesDirty] = useState(false);
    const [episodesInitialized, setEpisodesInitialized] = useState(!anime);
    const [localError, setLocalError] = useState<string | null>(null);
    const [jsonImportOpen, setJsonImportOpen] = useState(false);
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
        skip:
            !anime ||
            (activeTab !== "episodes" && !(episodesDirty && !initialEpisodesLoaded)),
    });

    const initialValues = useMemo(() => toFormValues(anime), [anime]);
    const form = useForm<AnimeFormValues>({
        defaultValues: initialValues,
    });
    const {
        handleSubmit,
        setValue,
        formState: { dirtyFields },
    } = form;

    useEffect(() => {
        if (!anime || !episodesQuery.data || initialEpisodesLoaded) {
            return;
        }

        const loadedEpisodes = toEpisodeForms(episodesQuery.data);
        setInitialEpisodes(cloneEpisodeForms(loadedEpisodes));
        setInitialEpisodesLoaded(true);

        if (!episodesDirty && !episodesInitialized) {
            setEpisodes(cloneEpisodeForms(loadedEpisodes));
            setEpisodesDirty(false);
            setActiveEpisodeIndex(0);
            setEpisodesInitialized(true);
        }
    }, [
        anime,
        episodesDirty,
        episodesInitialized,
        episodesQuery.data,
        initialEpisodesLoaded,
    ]);

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


    function markEpisodes(nextEpisodes: EpisodeForm[]) {
        setEpisodes(nextEpisodes);
        setEpisodesDirty(
            anime
                ? !areEpisodeFormsEqual(nextEpisodes, initialEpisodes)
                : nextEpisodes.length > 0,
        );
        setLocalError(null);
    }

    function resetAllEpisodes() {
        if (!anime || !initialEpisodesLoaded) return;
        setEpisodes(cloneEpisodeForms(initialEpisodes));
        setEpisodesDirty(false);
        setActiveEpisodeIndex(0);
        setLocalError(null);
    }

    function resetEpisode(index: number) {
        const current = episodes[index];
        const initial = initialEpisodes.find((episode) => episode.key === current?.key);
        if (!current || !initial) return;

        const duplicate = episodes.some(
            (episode, episodeIndex) =>
                episodeIndex !== index && Number(episode.number) === Number(initial.number),
        );
        if (duplicate) {
            setLocalError(
                `Неможливо скинути серію №${initial.number}: цей номер уже використовується.`,
            );
            return;
        }

        markEpisodes(
            episodes.map((episode, episodeIndex) =>
                episodeIndex === index ? cloneEpisodeForm(initial) : episode,
            ),
        );
    }

    function resetEpisodeField(
        index: number,
        field: "number" | "title",
    ) {
        const current = episodes[index];
        const initial = initialEpisodes.find((episode) => episode.key === current?.key);
        if (!current || !initial) return;

        if (field === "number") {
            const duplicate = episodes.some(
                (episode, episodeIndex) =>
                    episodeIndex !== index &&
                    Number(episode.number) === Number(initial.number),
            );
            if (duplicate) {
                setLocalError(
                    `Неможливо скинути номер до ${initial.number}: він уже використовується.`,
                );
                return;
            }
        }

        updateEpisode(index, field, initial[field]);
    }

    function resetVariant(episodeIndex: number, variantKey: string) {
        const currentEpisode = episodes[episodeIndex];
        const initialEpisode = initialEpisodes.find(
            (episode) => episode.key === currentEpisode?.key,
        );
        const initialVariant = initialEpisode?.variants.find(
            (variant) => variant.key === variantKey,
        );
        if (!currentEpisode || !initialVariant) return;

        updateEpisode(
            episodeIndex,
            "variants",
            currentEpisode.variants.map((variant) =>
                variant.key === variantKey
                    ? { ...initialVariant }
                    : variant,
            ),
        );
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
                key: `new-variant-${++variantKeyCounter.current}`,
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

    function importJsonData(data: AnimeImportData) {
        setLocalError(null);

        const patch = toImportFormPatch(data);
        for (const [key, value] of Object.entries(patch) as [
            keyof AnimeFormValues,
            AnimeFormValues[keyof AnimeFormValues],
        ][]) {
            setValue(key, value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
        }

        if (data.type && data.type !== AnimeType.TV) {
            setValue("episodesTotal", "", { shouldDirty: true });
            setValue("seasonNumber", "", { shouldDirty: true });

            if (data.type !== AnimeType.MOVIE) {
                setValue("partNumber", "", { shouldDirty: true });
            }
        }

        if (data.episodes !== undefined) {
            const importedEpisodes: EpisodeForm[] = data.episodes
                .map((episode) => ({
                    key: `import-${++episodeKeyCounter.current}`,
                    number: String(episode.number),
                    title: episode.title ?? "",
                    variants: (episode.variants ?? []).map((variant) => ({
                        key: `import-variant-${++variantKeyCounter.current}`,
                        sourceType: variant.sourceType ?? EpisodeSourceType.IFRAME,
                        endpoint: variant.endpoint,
                        dubType: variant.dubType,
                        dubTeamId: String(variant.dubTeamId),
                        playerId: String(variant.playerId),
                        isActive: variant.isActive ?? true,
                    })),
                }))
                .sort((a, b) => Number(a.number) - Number(b.number));

            setEpisodes(importedEpisodes);
            setEpisodesDirty(true);
            setEpisodesInitialized(true);
            setActiveEpisodeIndex(0);
        }
    }

    return (
        <form
            onSubmit={submit}
            className="flex min-h-full min-w-0 flex-1 flex-col lg:h-full lg:min-h-0"
        >
            <EditorHeader
                backHref="/admin/animes"
                backLabel="Назад до аніме"
                title={anime ? "Аніме" : "Створення аніме"}
                subtitle={anime ? `${anime.title} · #${anime.id}` : undefined}
                isSaving={isSaving}
                submitLabel={anime ? "Зберегти" : "Створити"}
                actions={
                    <Button
                        type="button"
                        color="primary-3"
                        onClick={() => setJsonImportOpen(true)}
                        className="w-full sm:w-auto"
                    >
                        <Braces size={17} />
                        Імпорт JSON
                    </Button>
                }
            />

            <AnimeJsonImportModal
                open={jsonImportOpen}
                onClose={() => setJsonImportOpen(false)}
                onImport={importJsonData}
            />

            <div className="mt-2 flex shrink-0 items-center gap-1 border-b border-white/[0.05] px-0.5">
                <EditorTabButton
                    active={activeTab === "main"}
                    onClick={() => setActiveTab("main")}
                >
                    Основна інформація
                </EditorTabButton>
                <EditorTabButton
                    active={activeTab === "episodes"}
                    onClick={() => setActiveTab("episodes")}
                >
                    Серії
                    {(episodesInitialized ? episodes.length : anime?._count.episodes ?? 0) > 0 && (
                        <span className="ml-1 rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[11px]">
                            {episodesInitialized ? episodes.length : anime?._count.episodes ?? 0}
                        </span>
                    )}
                </EditorTabButton>
            </div>

            <EditorError error={mutationError} />
            {localError && (
                <div className="mt-3 shrink-0 rounded-lg border border-red-400/15 bg-red-500/[0.07] px-4 py-3 text-[14px] text-red-200/90">
                    {localError}
                </div>
            )}

            {activeTab === "main" ? (
                <AnimeMainTab
                    anime={anime}
                    form={form}
                    genreOptions={genreOptions}
                    producerOptions={producerOptions}
                    stats={stats}
                />
            ) : (
                <div className="mt-3 grid min-h-[520px] flex-1 gap-4 lg:min-h-0 lg:grid-cols-[300px_minmax(0,1fr)]">
                    <section className="flex min-h-0 flex-col rounded-xl border border-white/[0.025] bg-[#11171c] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.12)] sm:p-4">
                        <div className="grid gap-2">
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
                            {anime && (
                                <FieldResetButton
                                    disabled={
                                        !episodesDirty ||
                                        !episodesInitialized ||
                                        !initialEpisodesLoaded
                                    }
                                    onClick={resetAllEpisodes}
                                    ariaLabel="Скинути всі зміни серій"
                                    className="w-full"
                                />
                            )}
                        </div>
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
                                initialEpisode={initialEpisodes.find(
                                    (item) =>
                                        item.key ===
                                        episodes[Math.min(activeEpisodeIndex, episodes.length - 1)]?.key,
                                )}
                                episodeIndex={Math.min(activeEpisodeIndex, episodes.length - 1)}
                                playerOptions={playerOptions}
                                dubTeamOptions={dubTeamOptions}
                                onEpisodeChange={updateEpisode}
                                onResetEpisode={resetEpisode}
                                onResetEpisodeField={resetEpisodeField}
                                onAddVariant={addVariant}
                                onVariantChange={updateVariant}
                                onResetVariant={resetVariant}
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
