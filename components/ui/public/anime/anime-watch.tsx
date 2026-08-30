"use client";

import {
    ChevronLeft,
    ChevronRight,
    Film,
    ListVideo,
    Maximize2,
    Minimize2,
    Play,
    X,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import { Select } from "@/components/ui/dropdowns/select";
import AnimeStrip from "@/components/ui/public/anime/anime-strip";
import { DubType } from "@/lib/types/entites/anime";
import { useAppSelector } from "@/lib/hooks/redux";
import { useRecordPublicAnimeViewMutation } from "@/lib/store/animi/public-endpoints";
import type {
    PublicAnimeDetails,
    PublicAnimeEpisode,
    PublicAnimeEpisodeVariant,
} from "@/lib/types/public";
import cn from "@/lib/utils/cn";

const EPISODES_PER_PAGE = 30;

type EpisodePanelMode = "sidebar" | "wide" | "popup";

export default function AnimeWatch({ anime }: { anime: PublicAnimeDetails }) {
    const episodes = anime.episodes ?? [];
    const firstEpisode = episodes.at(-1) ?? null;
    const [selectedEpisodeId, setSelectedEpisodeId] = useState<number | null>(firstEpisode?.id ?? null);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
        getPreferredVariant(firstEpisode?.variants ?? [])?.id ?? null,
    );
    const [episodePage, setEpisodePage] = useState(() =>
        firstEpisode ? Math.floor((episodes.length - 1) / EPISODES_PER_PAGE) : 0,
    );
    const [expanded, setExpanded] = useState(false);
    const user = useAppSelector((state) => state.auth.user);
    const [recordView] = useRecordPublicAnimeViewMutation();
    const recordedViewRef = useRef(false);

    const selectedEpisode =
        episodes.find((episode) => episode.id === selectedEpisodeId) ?? firstEpisode;
    const selectedVariant =
        selectedEpisode?.variants.find((variant) => variant.id === selectedVariantId) ??
        getPreferredVariant(selectedEpisode?.variants ?? []);

    useEffect(() => {
        if (!user || recordedViewRef.current || !selectedVariant?.endpoint) return;
        recordedViewRef.current = true;
        void recordView(anime.slug);
    }, [anime.slug, recordView, selectedVariant?.endpoint, user]);

    useEffect(() => {
        const desktop = window.matchMedia("(min-width: 1280px)");
        const sync = () => {
            if (!desktop.matches) setExpanded(false);
        };

        sync();
        desktop.addEventListener("change", sync);
        return () => desktop.removeEventListener("change", sync);
    }, []);

    function chooseEpisode(episode: PublicAnimeEpisode) {
        setSelectedEpisodeId(episode.id);
        setSelectedVariantId(getPreferredVariant(episode.variants)?.id ?? null);
    }

    const panelProps = {
        episodes,
        selectedEpisode,
        selectedVariant,
        page: episodePage,
        onPageChange: setEpisodePage,
        onEpisodeChange: chooseEpisode,
        onVariantChange: setSelectedVariantId,
    };

    return (
        <>
            <div
                className={cn(
                    "min-w-0 gap-4",
                    expanded ? "space-y-4 xl:block" : "grid xl:grid-cols-[minmax(0,1fr)_310px]",
                )}
            >
                <div className="min-w-0 space-y-4">
                    <Player
                        episode={selectedEpisode}
                        variant={selectedVariant}
                        expanded={expanded}
                        onToggleExpanded={() => setExpanded((value) => !value)}
                    />
                    {!expanded && <AnimeStrip title="Повʼязане" items={anime.relatedAnimes ?? []} compact />}
                </div>

                {!expanded && (
                    <div className="hidden xl:block">
                        <EpisodePanel {...panelProps} mode="sidebar" />
                    </div>
                )}

                {expanded && (
                    <div className="hidden space-y-4 xl:block">
                        <EpisodePanel {...panelProps} mode="wide" />
                        <AnimeStrip title="Повʼязане" items={anime.relatedAnimes ?? []} compact />
                    </div>
                )}

                <div className="hidden md:block xl:hidden">
                    <EpisodePanel {...panelProps} mode="wide" />
                </div>
            </div>

            <MobileEpisodePopup {...panelProps} />
        </>
    );
}

function Player({
    episode,
    variant,
    expanded,
    onToggleExpanded,
}: {
    episode: PublicAnimeEpisode | null;
    variant: PublicAnimeEpisodeVariant | null;
    expanded: boolean;
    onToggleExpanded: () => void;
}) {
    const source = safePlayerSource(variant?.endpoint);

    return (
        <section className="overflow-hidden rounded-2xl border border-white/[0.055] bg-[#10161b]/96 shadow-[0_24px_70px_rgba(0,0,0,.26)]">
            <div className="flex min-h-11 items-center justify-between gap-3 border-b border-white/[0.05] px-4">
                <div className="min-w-0">
                    <p className="truncate text-[13px] text-white/70">
                        {episode ? `Епізод ${episode.number}${episode.title ? ` · ${episode.title}` : ""}` : "Перегляд"}
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    {variant && (
                        <span className="hidden text-[11px] text-white/30 sm:inline">
                            {variant.dubType === DubType.DUB ? "Озвучення" : "Субтитри"} · {variant.dubTeam.title}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={onToggleExpanded}
                        aria-pressed={expanded}
                        aria-label={expanded ? "Звичайний розмір плеєра" : "Розширити плеєр"}
                        title={expanded ? "Звичайний розмір" : "Розширити плеєр"}
                        className="hidden size-8 cursor-pointer place-items-center rounded-lg border border-white/[0.05] bg-white/[0.035] text-white/42 transition hover:bg-white/[0.075] hover:text-white/78 xl:grid"
                    >
                        {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                    </button>
                </div>
            </div>

            <div
                className={cn(
                    "relative aspect-video min-h-[250px] bg-[#080b0e] sm:min-h-[360px] xl:min-h-0",
                    expanded && "xl:w-full",
                )}
            >
                {source ? (
                    <iframe
                        key={`${episode?.id ?? 0}-${variant?.id ?? 0}`}
                        src={source}
                        title={`${episode?.number ?? ""} епізод ${variant?.player.title ?? ""}`}
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 size-full border-0"
                    />
                ) : (
                    <div className="absolute inset-0 grid place-items-center p-6 text-center">
                        <div>
                            <span className="mx-auto grid size-14 place-items-center rounded-full border border-white/[0.06] bg-white/[0.035] text-white/24">
                                {episode ? <Play size={23} /> : <Film size={23} />}
                            </span>
                            <p className="mt-3 text-[14px] text-white/48">
                                {episode ? "Для цього варіанта немає доступного плеєра" : "Епізоди поки що не додані"}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

function EpisodePanel({
    episodes,
    selectedEpisode,
    selectedVariant,
    page,
    onPageChange,
    onEpisodeChange,
    onVariantChange,
    mode,
}: {
    episodes: PublicAnimeEpisode[];
    selectedEpisode: PublicAnimeEpisode | null;
    selectedVariant: PublicAnimeEpisodeVariant | null;
    page: number;
    onPageChange: (page: number) => void;
    onEpisodeChange: (episode: PublicAnimeEpisode) => void;
    onVariantChange: (id: number) => void;
    mode: EpisodePanelMode;
}) {
    const variants = selectedEpisode?.variants ?? [];
    const players = useMemo(() => uniqueById(variants.map((variant) => variant.player)), [variants]);
    const dubTypes = useMemo(
        () =>
            [...new Set(
                variants
                    .filter((variant) => !selectedVariant || variant.player.id === selectedVariant.player.id)
                    .map((variant) => variant.dubType),
            )],
        [variants, selectedVariant],
    );
    const teams = useMemo(
        () =>
            uniqueById(
                variants
                    .filter(
                        (variant) =>
                            (!selectedVariant || variant.player.id === selectedVariant.player.id) &&
                            (!selectedVariant || variant.dubType === selectedVariant.dubType),
                    )
                    .map((variant) => variant.dubTeam),
            ),
        [variants, selectedVariant],
    );

    const totalPages = Math.max(1, Math.ceil(episodes.length / EPISODES_PER_PAGE));
    const safePage = Math.min(page, totalPages - 1);
    const visibleEpisodes = episodes.slice(
        safePage * EPISODES_PER_PAGE,
        (safePage + 1) * EPISODES_PER_PAGE,
    );

    function pickVariant(predicate: (variant: PublicAnimeEpisodeVariant) => boolean) {
        const next = variants.find(predicate);
        if (next) onVariantChange(next.id);
    }

    const wide = mode === "wide";
    const popup = mode === "popup";

    return (
        <aside
            className={cn(
                "rounded-2xl",
                popup
                    ? "bg-transparent"
                    : "border border-white/[0.055] bg-[#10161b]/96 p-4 shadow-[0_24px_70px_rgba(0,0,0,.22)]",
                mode === "sidebar" && "min-h-[560px]",
            )}
        >
            {!popup && <h2 className="text-[16px] font-medium text-white/82">Епізоди</h2>}

            {selectedEpisode && selectedVariant && (
                <div
                    className={cn(
                        popup ? "grid grid-cols-3 gap-2" : "mt-3 grid gap-2",
                        mode === "sidebar" ? "grid-cols-1" : "sm:grid-cols-3",
                        wide && "grid-cols-3",
                    )}
                >
                    <EpisodeSelect
                        label="Плеєр"
                        value={String(selectedVariant.player.id)}
                        options={players.map((player) => ({ value: String(player.id), label: player.title }))}
                        onChange={(value) => {
                            const playerVariants = variants.filter(
                                (variant) => variant.player.id === Number(value),
                            );
                            const matchingDub = playerVariants.filter(
                                (variant) => variant.dubType === selectedVariant.dubType,
                            );
                            const next = getPreferredVariant(matchingDub.length ? matchingDub : playerVariants);
                            if (next) onVariantChange(next.id);
                        }}
                    />
                    <EpisodeSelect
                        label="Переклад"
                        value={selectedVariant.dubType}
                        options={dubTypes.map((value) => ({
                            value,
                            label: value === DubType.DUB ? "Озвучення" : "Субтитри",
                        }))}
                        onChange={(value) =>
                            pickVariant(
                                (variant) =>
                                    variant.player.id === selectedVariant.player.id &&
                                    variant.dubType === value,
                            )
                        }
                    />
                    <EpisodeSelect
                        label="Команда"
                        value={String(selectedVariant.dubTeam.id)}
                        options={teams.map((team) => ({ value: String(team.id), label: team.title }))}
                        onChange={(value) =>
                            pickVariant(
                                (variant) =>
                                    variant.player.id === selectedVariant.player.id &&
                                    variant.dubType === selectedVariant.dubType &&
                                    variant.dubTeam.id === Number(value),
                            )
                        }
                    />
                </div>
            )}

            <div className={cn("flex items-center gap-2", popup ? "mt-3" : "mt-3")}>
                <button
                    type="button"
                    disabled={safePage <= 0}
                    onClick={() => onPageChange(Math.max(0, safePage - 1))}
                    className="grid size-8 cursor-pointer place-items-center rounded-lg bg-white/[0.045] text-white/45 transition hover:bg-white/[0.08] disabled:cursor-default disabled:opacity-25"
                    aria-label="Попередня сторінка епізодів"
                >
                    <ChevronLeft size={16} />
                </button>
                <div className="flex h-8 flex-1 items-center justify-center rounded-lg bg-white/[0.035] text-[11px] text-white/35">
                    {episodes.length
                        ? `${safePage * EPISODES_PER_PAGE + 1}–${Math.min((safePage + 1) * EPISODES_PER_PAGE, episodes.length)} з ${episodes.length}`
                        : "Немає епізодів"}
                </div>
                <button
                    type="button"
                    disabled={safePage >= totalPages - 1}
                    onClick={() => onPageChange(Math.min(totalPages - 1, safePage + 1))}
                    className="grid size-8 cursor-pointer place-items-center rounded-lg bg-white/[0.045] text-white/45 transition hover:bg-white/[0.08] disabled:cursor-default disabled:opacity-25"
                    aria-label="Наступна сторінка епізодів"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            <div
                className={cn(
                    "mt-3 grid gap-1.5",
                    mode === "sidebar" && "grid-cols-5",
                    wide && "grid-cols-10 lg:grid-cols-[repeat(15,minmax(0,1fr))]",
                    popup && "grid-cols-6 min-[480px]:grid-cols-10",
                )}
            >
                {visibleEpisodes.map((episode) => (
                    <button
                        key={episode.id}
                        type="button"
                        onClick={() => onEpisodeChange(episode)}
                        title={episode.title || `Епізод ${episode.number}`}
                        className={cn(
                            "h-8 cursor-pointer rounded-lg border text-[11px] transition",
                            selectedEpisode?.id === episode.id
                                ? "[border-color:color-mix(in_srgb,var(--primary)_50%,transparent)] bg-(--primary) text-white shadow-[0_5px_15px_rgba(228,95,58,.22)]"
                                : "border-white/[0.045] bg-white/[0.035] text-white/48 hover:bg-white/[0.075] hover:text-white/75",
                        )}
                    >
                        {episode.number}
                    </button>
                ))}
            </div>
        </aside>
    );
}

function EpisodeSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
}) {
    return (
        <label className="block min-w-0">
            <span className="mb-1 block truncate text-[10px] uppercase tracking-[.08em] text-white/24">{label}</span>
            <Select
                value={value}
                options={options}
                onChange={onChange}
                className="w-full"
                buttonClassName="h-9 rounded-lg px-2.5 text-[11px]"
                dropdownClassName="z-[150] max-h-[220px]"
            />
        </label>
    );
}

function MobileEpisodePopup({
    episodes,
    selectedEpisode,
    selectedVariant,
    page,
    onPageChange,
    onEpisodeChange,
    onVariantChange,
}: {
    episodes: PublicAnimeEpisode[];
    selectedEpisode: PublicAnimeEpisode | null;
    selectedVariant: PublicAnimeEpisodeVariant | null;
    page: number;
    onPageChange: (page: number) => void;
    onEpisodeChange: (episode: PublicAnimeEpisode) => void;
    onVariantChange: (id: number) => void;
}) {
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    if (!mounted) return null;

    return createPortal(
        <div className="md:hidden">
            <div className="fixed inset-x-3 bottom-[calc(86px+env(safe-area-inset-bottom))] z-[90]">
                <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpen((value) => !value)}
                    className={cn(
                        "mx-auto flex h-12 w-full max-w-[560px] items-center justify-center gap-2 rounded-2xl border px-4 text-[14px] font-medium shadow-[0_14px_45px_rgba(0,0,0,.42)] backdrop-blur-xl transition active:scale-[0.99]",
                        open
                            ? "text-(--primary) [border-color:color-mix(in_srgb,var(--primary)_34%,transparent)] [background-color:color-mix(in_srgb,var(--primary)_12%,#151c22)]"
                            : "border-white/[0.08] bg-[#151c22]/96 text-white/82",
                    )}
                >
                    {open ? <X size={17} /> : <ListVideo size={17} />}
                    {open ? "Закрити епізоди" : "Епізоди"}
                    {selectedEpisode && (
                        <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/55">
                            {selectedEpisode.number}
                        </span>
                    )}
                </button>
            </div>

            {open && (
                <>
                    <button
                        type="button"
                        aria-label="Закрити епізоди"
                        onClick={() => setOpen(false)}
                        className="fixed inset-x-0 top-0 bottom-[calc(86px+env(safe-area-inset-bottom))] z-[81] bg-black/55 backdrop-blur-[2px]"
                    />
                    <div className="fixed inset-x-2 bottom-[calc(142px+env(safe-area-inset-bottom))] z-[88]">
                        <div className="mx-auto max-h-[calc(100dvh-158px-env(safe-area-inset-bottom))] w-full max-w-[560px] overflow-y-auto overscroll-contain rounded-[24px] border border-white/[0.08] bg-[#10161b]/98 p-3 shadow-[0_28px_80px_rgba(0,0,0,.58)] backdrop-blur-2xl">
                            <div className="sticky top-0 z-[120] mb-3 flex items-center justify-between rounded-xl bg-[#10161b]/96 px-1 pb-2 pt-1 backdrop-blur-xl">
                                <div>
                                    <p className="text-[15px] font-medium text-white/90">Епізоди</p>
                                    <p className="mt-0.5 text-[11px] text-white/34">
                                        Оберіть плеєр, переклад, команду та серію
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="grid size-9 place-items-center rounded-xl bg-white/[0.045] text-white/55 transition active:scale-95"
                                    aria-label="Закрити епізоди"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <EpisodePanel
                                episodes={episodes}
                                selectedEpisode={selectedEpisode}
                                selectedVariant={selectedVariant}
                                page={page}
                                onPageChange={onPageChange}
                                onEpisodeChange={(episode) => {
                                    onEpisodeChange(episode);
                                    setOpen(false);
                                }}
                                onVariantChange={onVariantChange}
                                mode="popup"
                            />
                        </div>
                    </div>
                </>
            )}
        </div>,
        document.body,
    );
}

function getPreferredVariant(variants: PublicAnimeEpisodeVariant[]) {
    if (!variants.length) return null;

    const asdiVariants = variants.filter((variant) => isAsdiPlayer(variant.player.title));
    const preferredPlayerVariants = asdiVariants.length ? asdiVariants : variants;

    return (
        preferredPlayerVariants.find((variant) => variant.dubType === DubType.DUB) ??
        preferredPlayerVariants[0]
    );
}

function isAsdiPlayer(title: string) {
    return title.trim().toLowerCase() === "asdi";
}

function uniqueById<T extends { id: number }>(items: T[]) {
    return [...new Map(items.map((item) => [item.id, item])).values()];
}

function safePlayerSource(endpoint?: string | null) {
    if (!endpoint) return null;
    const iframeMatch = endpoint.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    const raw = (iframeMatch?.[1] ?? endpoint).trim();
    try {
        const url = new URL(raw);
        return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
    } catch {
        return null;
    }
}
