"use client";

import Image from "next/image";
import { LoaderCircle, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import PublicModal from "@/components/ui/public/shared/public-modal";
import {
    useAddPublicPlaylistItemMutation,
    useLazySearchPublicQuery,
} from "@/lib/store/animi/public-endpoints";
import type { PublicPlaylistItem, PublicSearchAnimeItem } from "@/lib/types/public";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { imageSrc } from "@/lib/utils/public-anime";

const PLAYLIST_ITEM_LIMIT = 30;

export default function PlaylistAddAnimeModal({
    username,
    slug,
    open,
    existingAnimeIds,
    onClose,
    onCreated,
}: {
    username: string;
    slug: string;
    open: boolean;
    existingAnimeIds: number[];
    onClose: () => void;
    onCreated: (item: PublicPlaylistItem) => void;
}) {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<PublicSearchAnimeItem | null>(null);
    const [description, setDescription] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [search, searchState] = useLazySearchPublicQuery();
    const [addItem, addState] = useAddPublicPlaylistItemMutation();
    const isFull = existingAnimeIds.length >= PLAYLIST_ITEM_LIMIT;

    useEffect(() => {
        if (!open || isFull) return;
        const normalized = query.trim();
        if (normalized.length < 2) return;
        const timeout = window.setTimeout(() => {
            void search({ query: normalized, limit: 8 });
        }, 260);
        return () => window.clearTimeout(timeout);
    }, [isFull, open, query, search]);

    useEffect(() => {
        if (open) return;
        setQuery("");
        setSelected(null);
        setDescription("");
        setError(null);
    }, [open]);

    const results = searchState.data?.type === "anime" ? searchState.data.items : [];

    async function submit() {
        if (!selected || isFull) return;
        setError(null);
        try {
            const item = await addItem({
                username,
                slug,
                animeId: selected.id,
                description: description.trim() || undefined,
            }).unwrap();
            onCreated(item);
            onClose();
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Не вдалося додати аніме до списку."));
        }
    }

    return (
        <PublicModal
            open={open}
            onClose={onClose}
            busy={addState.isLoading}
            panelClassName="flex max-h-[calc(100dvh-24px)] max-w-[680px] flex-col overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#11171c] shadow-[0_28px_90px_rgba(0,0,0,.58)]"
        >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.05] p-4 sm:p-5">
                <div>
                    <h2 className="text-[19px] font-medium text-white/92">Додати аніме</h2>
                    <p className="mt-1 text-[13px] text-white/36">
                        {isFull
                            ? "У цьому списку вже максимально дозволені 30 аніме."
                            : `Знайди тайтл, додай примітку та збережи його у списку · ${existingAnimeIds.length}/${PLAYLIST_ITEM_LIMIT}.`}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={addState.isLoading}
                    className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl bg-white/[0.045] text-white/45 transition hover:bg-white/[0.08] hover:text-white/75 disabled:opacity-50"
                    aria-label="Закрити"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                {isFull ? (
                    <div className="grid min-h-[220px] place-items-center rounded-[16px] border border-dashed border-white/[0.055] bg-[#0d1317] px-5 text-center">
                        <div>
                            <p className="text-[15px] text-white/55">Ліміт списку вичерпано</p>
                            <p className="mt-1 text-[12px] leading-5 text-white/28">
                                Видали одне з аніме, щоб додати інше.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex h-11 items-center gap-2 rounded-xl border border-white/[0.055] bg-[#171d22] px-3.5 focus-within:border-white/15">
                            <Search size={18} className="text-white/35" />
                            <input
                                value={query}
                                onChange={(event) => {
                                    setQuery(event.target.value);
                                    setSelected(null);
                                }}
                                autoFocus
                                placeholder="Пошук аніме"
                                className="min-w-0 flex-1 bg-transparent text-[14px] text-white/86 outline-none placeholder:text-white/25"
                            />
                            {searchState.isFetching && <LoaderCircle size={16} className="animate-spin text-white/30" />}
                        </div>

                        {!selected && query.trim().length >= 2 && (
                            <div className="mt-3 space-y-2">
                                {results.length ? (
                                    results.map((anime) => {
                                        const exists = existingAnimeIds.includes(anime.id);
                                        const poster = imageSrc(anime.poster?.path);
                                        return (
                                            <button
                                                key={anime.id}
                                                type="button"
                                                disabled={exists}
                                                onClick={() => setSelected(anime)}
                                                className="flex w-full items-center gap-3 rounded-xl border border-white/[0.045] bg-[#0d1317] p-2.5 text-left transition hover:border-white/10 hover:bg-white/[0.035] disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-white/[0.04]">
                                                    {poster && <Image src={poster} alt="" fill unoptimized sizes="48px" className="object-cover" />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-[14px] text-white/82">{anime.title}</p>
                                                    <p className="mt-1 text-[12px] text-white/30">
                                                        {exists ? "Вже є у списку" : `${anime.type} · ${anime.status}`}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : !searchState.isFetching ? (
                                    <div className="rounded-xl border border-dashed border-white/[0.05] px-4 py-8 text-center text-[13px] text-white/30">
                                        Нічого не знайдено
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {selected && (
                            <div className="mt-3 rounded-[16px] border border-white/[0.055] bg-[#0d1317] p-3.5">
                                <div className="flex items-center gap-3">
                                    <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-white/[0.04]">
                                        {imageSrc(selected.poster?.path) && (
                                            <Image src={imageSrc(selected.poster?.path)!} alt="" fill unoptimized sizes="56px" className="object-cover" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[15px] font-medium text-white/88">{selected.title}</p>
                                        <p className="mt-1 text-[12px] text-white/30">{selected.type} · {selected.status}</p>
                                        <button
                                            type="button"
                                            onClick={() => setSelected(null)}
                                            className="mt-2 text-[12px] text-(--primary-3) hover:underline"
                                        >
                                            Обрати інше
                                        </button>
                                    </div>
                                </div>

                                <label className="mt-4 block">
                                    <span className="mb-1.5 block text-[11px] uppercase tracking-[.08em] text-white/28">Моя примітка</span>
                                    <textarea
                                        value={description}
                                        onChange={(event) => setDescription(event.target.value)}
                                        maxLength={2000}
                                        rows={4}
                                        placeholder="Чому це аніме у списку, що в ньому особливого тощо"
                                        className="min-h-24 w-full resize-y rounded-xl border border-white/[0.055] bg-[#171d22] px-3.5 py-3 text-[14px] leading-5 text-white/84 outline-none placeholder:text-white/24 focus:border-white/15"
                                    />
                                </label>
                            </div>
                        )}
                    </>
                )}

                {error && (
                    <div className="mt-3 rounded-xl border border-red-400/15 bg-red-500/[0.07] px-3.5 py-2.5 text-[13px] text-red-200/85">
                        {error}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2 border-t border-white/[0.05] p-4 sm:px-5">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={addState.isLoading}
                    className="h-10 cursor-pointer rounded-xl border border-white/[0.055] bg-white/[0.035] px-4 text-[14px] text-white/55 transition hover:bg-white/[0.07] disabled:opacity-50"
                >
                    Скасувати
                </button>
                {!isFull && (
                    <button
                        type="button"
                        onClick={submit}
                        disabled={!selected || addState.isLoading}
                        className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-(--primary) px-4 text-[14px] font-medium text-white transition hover:bg-(--primary-3) disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {addState.isLoading ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />}
                        Додати
                    </button>
                )}
            </div>
        </PublicModal>
    );
}
