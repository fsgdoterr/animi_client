"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { Link2, Plus, Search, Unlink } from "lucide-react";

import Modal from "@/components/ui/admin/shared/modal";
import { Button } from "@/components/ui/buttons/button";
import { Input } from "@/components/ui/inputs/input";
import TablePoster from "@/components/ui/tables/table-poster";
import {
    useGetAnimesQuery,
    useLazyGetAnimeQuery,
} from "@/lib/store/animi/anime-endpoints";
import type {
    Anime,
    AnimeListItem,
    RelatedAnime,
} from "@/lib/types/entites/anime";
import { animeStatusLabel, animeTypeLabel } from "./anime-options";

export default function RelatedAnimePicker({
    initialItems,
    currentAnimeId,
    value,
    onChange,
}: {
    initialItems: RelatedAnime[];
    currentAnimeId?: number;
    value: number | null;
    onChange: (id: number | null) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectionError, setSelectionError] = useState<string | null>(null);
    const [groupItems, setGroupItems] = useState<RelatedAnime[]>(initialItems);
    const deferredSearch = useDeferredValue(search.trim());
    const [loadAnime, loadAnimeState] = useLazyGetAnimeQuery();

    const { data, isFetching } = useGetAnimesQuery(
        {
            search: deferredSearch || undefined,
            page: 1,
            limit: 12,
            sort: "new",
        },
        { skip: !open || deferredSearch.length === 0 },
    );

    const results = (data?.items ?? []).filter(
        (anime) => anime.id !== currentAnimeId,
    );

    useEffect(() => {
        if (value == null) {
            if (groupItems.length > 0) setGroupItems([]);
            return;
        }

        if (groupItems.some((item) => item.id === value)) return;

        let cancelled = false;
        void loadAnime(value)
            .unwrap()
            .then((anchor) => {
                if (cancelled) return;
                const anchorItem = toRelatedAnime(anchor);
                setGroupItems(
                    uniqueRelatedAnimes([anchorItem, ...anchor.relatedAnimes]).filter(
                        (item) => item.id !== currentAnimeId,
                    ),
                );
                setSelectionError(null);
            })
            .catch(() => {
                if (!cancelled) {
                    setSelectionError(
                        "Не вдалося завантажити аніме, вказане в JSON.",
                    );
                }
            });

        return () => {
            cancelled = true;
        };
    }, [currentAnimeId, groupItems, loadAnime, value]);

    async function selectAnime(anime: AnimeListItem) {
        setSelectionError(null);

        try {
            const anchor = await loadAnime(anime.id).unwrap();
            const anchorItem = toRelatedAnime(anchor);
            const anchorGroup = uniqueRelatedAnimes([
                anchorItem,
                ...anchor.relatedAnimes,
            ]).filter((item) => item.id !== currentAnimeId);

            // If the selected anime has no relation yet but the current anime
            // already belongs to one, the server adds the selected anime to the
            // current group. Mirror that result in the preview before saving.
            const nextGroup =
                currentAnimeId &&
                initialItems.length > 0 &&
                anchor.relatedAnimes.length === 0
                    ? uniqueRelatedAnimes([...initialItems, anchorItem])
                    : anchorGroup;

            setGroupItems(nextGroup);
            onChange(anime.id);
            setOpen(false);
            setSearch("");
        } catch {
            setSelectionError(
                "Не вдалося отримати звʼязки цього аніме. Спробуйте ще раз.",
            );
        }
    }

    function clearRelation() {
        setGroupItems([]);
        setSelectionError(null);
        onChange(null);
    }

    return (
        <>
            <div className="rounded-xl border border-white/[0.035] bg-[#171d22] p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-[14px] text-white/68">
                            {groupItems.length > 0
                                ? `У серії: ${groupItems.length + 1} аніме`
                                : "Аніме не привʼязане до серії"}
                        </p>
                        <p className="mt-0.5 max-w-2xl text-[12px] leading-5 text-white/30">
                            Оберіть лише одне аніме. Якщо воно вже належить до
                            серії, поточне аніме автоматично приєднається до всієї
                            групи.
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                        {groupItems.length > 0 && (
                            <Button
                                type="button"
                                color="primary"
                                onClick={clearRelation}
                                className="w-full sm:w-auto"
                            >
                                <Unlink size={16} />
                                Відʼєднати
                            </Button>
                        )}
                        <Button
                            type="button"
                            color="green"
                            onClick={() => setOpen(true)}
                            className="w-full sm:w-auto"
                        >
                            <Plus size={16} />
                            {groupItems.length > 0
                                ? "Змінити звʼязок"
                                : "Додати звʼязок"}
                        </Button>
                    </div>
                </div>

                {groupItems.length > 0 && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {groupItems.map((anime) => (
                            <div
                                key={anime.id}
                                className="flex min-w-0 items-center gap-3 rounded-lg border border-white/[0.05] bg-[#10161b] p-2.5"
                            >
                                <TablePoster poster={anime.poster} title={anime.title} />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[14px] text-white/86">
                                        {anime.title}
                                    </p>
                                    <p className="mt-0.5 truncate text-[12px] text-white/34">
                                        {animeTypeLabel(anime.type)} · {animeStatusLabel(anime.status)} · #{anime.id}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {selectionError && (
                    <p className="mt-3 text-[12px] text-red-300/80">
                        {selectionError}
                    </p>
                )}
            </div>

            <Modal
                open={open}
                title="Привʼязати до серії аніме"
                onClose={() => {
                    setOpen(false);
                    setSearch("");
                    setSelectionError(null);
                }}
                className="sm:w-[min(680px,calc(100vw-32px))]"
            >
                <Input
                    icon={<Search size={18} />}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Почніть вводити назву аніме"
                    autoFocus
                />

                <div className="mt-3 max-h-[420px] overflow-y-auto rounded-xl border border-white/[0.05] bg-[#0d1317] p-1.5">
                    {!deferredSearch ? (
                        <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center text-[13px] text-white/30">
                            <Link2 size={24} className="mb-2 text-white/20" />
                            Введіть назву будь-якого аніме з потрібної серії.
                        </div>
                    ) : isFetching ? (
                        <div className="flex min-h-40 items-center justify-center text-[13px] text-white/35">
                            Пошук...
                        </div>
                    ) : results.length === 0 ? (
                        <div className="flex min-h-40 items-center justify-center px-6 text-center text-[13px] text-white/30">
                            Нічого не знайдено.
                        </div>
                    ) : (
                        results.map((anime) => (
                            <button
                                key={anime.id}
                                type="button"
                                disabled={loadAnimeState.isLoading}
                                onClick={() => selectAnime(anime)}
                                className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition hover:bg-white/[0.05] disabled:cursor-wait disabled:opacity-55"
                            >
                                <TablePoster poster={anime.poster} title={anime.title} />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[14px] text-white/88">
                                        {anime.title}
                                    </p>
                                    <p className="mt-0.5 truncate text-[12px] text-white/34">
                                        {anime.originalTitle || anime.engTitle || animeTypeLabel(anime.type)}
                                    </p>
                                </div>
                                <Plus size={17} className="shrink-0 text-(--green)" />
                            </button>
                        ))
                    )}
                </div>

                {selectionError && (
                    <p className="mt-3 text-[12px] text-red-300/80">
                        {selectionError}
                    </p>
                )}
            </Modal>
        </>
    );
}

function toRelatedAnime(anime: Anime): RelatedAnime {
    return {
        id: anime.id,
        slug: anime.slug,
        title: anime.title,
        originalTitle: anime.originalTitle,
        engTitle: anime.engTitle,
        type: anime.type,
        status: anime.status,
        poster: anime.poster,
    };
}

function uniqueRelatedAnimes(items: RelatedAnime[]) {
    const byId = new Map<number, RelatedAnime>();
    for (const item of items) byId.set(item.id, item);
    return [...byId.values()];
}
