"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { Clapperboard, Search } from "lucide-react";

import Modal from "@/components/ui/admin/shared/modal";
import { Button } from "@/components/ui/buttons/button";
import { Input } from "@/components/ui/inputs/input";
import TablePoster from "@/components/ui/tables/table-poster";
import { useGetAnimesQuery } from "@/lib/store/animi/anime-endpoints";
import type { AnimeListItem } from "@/lib/types/entites/anime";
import type { AnimeCodeAnime } from "@/lib/types/entites/code";
import { animeStatusLabel, animeTypeLabel } from "../animes/anime-options";

export default function AnimeCodePicker({
    value,
    initialAnime,
    onChange,
}: {
    value: number | null;
    initialAnime: AnimeCodeAnime | null;
    onChange: (anime: AnimeCodeAnime) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<AnimeCodeAnime | null>(initialAnime);
    const deferredSearch = useDeferredValue(search.trim());

    const { data, isFetching } = useGetAnimesQuery(
        {
            search: deferredSearch || undefined,
            page: 1,
            limit: 15,
            sort: "new",
        },
        { skip: !open || deferredSearch.length === 0 },
    );

    useEffect(() => {
        if (value == null) {
            setSelected(null);
            return;
        }
        if (selected?.id === value) return;
        if (initialAnime?.id === value) setSelected(initialAnime);
    }, [initialAnime, selected?.id, value]);

    function selectAnime(anime: AnimeListItem) {
        const next = toCodeAnime(anime);
        setSelected(next);
        onChange(next);
        setOpen(false);
        setSearch("");
    }

    return (
        <>
            <div className="rounded-xl border border-white/[0.035] bg-[#171d22] p-3">
                {selected ? (
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            <TablePoster poster={selected.poster} title={selected.title} />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[15px] text-white/88">
                                    {selected.title}
                                </p>
                                <p className="mt-0.5 truncate text-[12px] text-white/35">
                                    {animeTypeLabel(selected.type)} · {animeStatusLabel(selected.status)} · #{selected.id}
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            color="primary"
                            onClick={() => setOpen(true)}
                            className="w-full sm:w-auto"
                        >
                            <Search size={16} />
                            Змінити
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3 px-4 py-7 text-center">
                        <div className="flex size-11 items-center justify-center rounded-full bg-white/[0.035] text-white/28">
                            <Clapperboard size={21} />
                        </div>
                        <div>
                            <p className="text-[14px] text-white/66">Аніме не вибране</p>
                            <p className="mt-1 text-[12px] text-white/30">
                                Код має бути привʼязаний до одного аніме.
                            </p>
                        </div>
                        <Button type="button" color="green" onClick={() => setOpen(true)}>
                            <Search size={16} />
                            Вибрати аніме
                        </Button>
                    </div>
                )}
            </div>

            <Modal
                open={open}
                title="Вибір аніме"
                onClose={() => {
                    setOpen(false);
                    setSearch("");
                }}
                className="sm:w-[min(680px,calc(100vw-32px))]"
            >
                <Input
                    icon={<Search size={18} />}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Пошук за назвою аніме"
                    autoFocus
                />

                <div className="mt-3 max-h-[430px] overflow-y-auto rounded-xl border border-white/[0.05] bg-[#0d1317] p-1.5">
                    {!deferredSearch ? (
                        <div className="flex min-h-44 flex-col items-center justify-center px-6 text-center text-[13px] text-white/30">
                            <Search size={24} className="mb-2 text-white/20" />
                            Почніть вводити українську, ромадзі або англійську назву.
                        </div>
                    ) : isFetching ? (
                        <div className="flex min-h-44 items-center justify-center text-[13px] text-white/35">
                            Пошук...
                        </div>
                    ) : (data?.items.length ?? 0) === 0 ? (
                        <div className="flex min-h-44 items-center justify-center px-6 text-center text-[13px] text-white/30">
                            Аніме не знайдено.
                        </div>
                    ) : (
                        data?.items.map((anime) => (
                            <button
                                key={anime.id}
                                type="button"
                                onClick={() => selectAnime(anime)}
                                className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition hover:bg-white/[0.05]"
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
                                <span className="shrink-0 text-[12px] text-white/25">#{anime.id}</span>
                            </button>
                        ))
                    )}
                </div>
            </Modal>
        </>
    );
}

function toCodeAnime(anime: AnimeListItem): AnimeCodeAnime {
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
