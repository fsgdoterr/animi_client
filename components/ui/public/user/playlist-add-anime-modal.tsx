"use client";

import Image from "next/image";
import { Bookmark, Check, LoaderCircle, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import PublicModal from "@/components/ui/public/shared/public-modal";
import {
    useAddPublicPlaylistItemMutation,
    useGetPublicBookmarkIdsQuery,
    useGetPublicBookmarksQuery,
    useLazySearchPublicQuery,
} from "@/lib/store/animi/public-endpoints";
import type {
    PublicPlaylistItem,
    PublicSearchAnimeItem,
    PublicUserAnime,
} from "@/lib/types/public";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import cn from "@/lib/utils/cn";
import { imageSrc } from "@/lib/utils/public-anime";

const PLAYLIST_ITEM_LIMIT = 30;
const BOOKMARK_PAGE_SIZE = 20;
type Source = "bookmarks" | "search";
type SelectableAnime = PublicSearchAnimeItem | PublicUserAnime;

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
    const [source, setSource] = useState<Source>("bookmarks");
    const [query, setQuery] = useState("");
    const [bookmarkPage, setBookmarkPage] = useState(1);
    const [selected, setSelected] = useState<SelectableAnime | null>(null);
    const [description, setDescription] = useState("");
    const [removeFromBookmarks, setRemoveFromBookmarks] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, searchState] = useLazySearchPublicQuery();
    const [addItem, addState] = useAddPublicPlaylistItemMutation();
    const isFull = existingAnimeIds.length >= PLAYLIST_ITEM_LIMIT;
    const { data: bookmarkIds } = useGetPublicBookmarkIdsQuery(undefined, { skip: !open || isFull });
    const { data: bookmarks, isFetching: bookmarksFetching } = useGetPublicBookmarksQuery(
        { page: bookmarkPage, limit: BOOKMARK_PAGE_SIZE },
        { skip: !open || isFull },
    );

    useEffect(() => {
        if (!open || isFull || source !== "search") return;
        const normalized = query.trim();
        if (normalized.length < 2) return;
        const timeout = window.setTimeout(() => {
            void search({ query: normalized, limit: 8 });
        }, 260);
        return () => window.clearTimeout(timeout);
    }, [isFull, open, query, search, source]);

    useEffect(() => {
        if (open) return;
        setSource("bookmarks");
        setQuery("");
        setBookmarkPage(1);
        setSelected(null);
        setDescription("");
        setRemoveFromBookmarks(false);
        setError(null);
    }, [open]);

    const searchResults = searchState.data?.type === "anime" ? searchState.data.items : [];
    const bookmarkAnimeIds = useMemo(() => new Set(bookmarkIds ?? []), [bookmarkIds]);
    const selectedFromBookmarks = selected ? bookmarkAnimeIds.has(selected.id) : false;

    function chooseAnime(anime: SelectableAnime) {
        setSelected(anime);
        setRemoveFromBookmarks(false);
        setError(null);
    }

    async function submit() {
        if (!selected || isFull) return;
        setError(null);
        try {
            const item = await addItem({
                username,
                slug,
                animeId: selected.id,
                description: description.trim() || undefined,
                removeFromBookmarks: selectedFromBookmarks && removeFromBookmarks,
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
            panelClassName="flex h-[min(680px,calc(100dvh-24px))] max-w-[680px] flex-col overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#11171c] shadow-[0_28px_90px_rgba(0,0,0,.58)] sm:h-[min(720px,calc(100dvh-48px))]"
        >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/[0.05] p-4 sm:p-5">
                <div>
                    <h2 className="text-[19px] font-medium text-white/92">Додати аніме</h2>
                    <p className="mt-1 text-[13px] text-white/36">
                        {isFull
                            ? "У цьому списку вже максимально дозволені 30 аніме."
                            : `Обери із закладок або знайди тайтл через пошук · ${existingAnimeIds.length}/${PLAYLIST_ITEM_LIMIT}.`}
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
                            <p className="mt-1 text-[12px] leading-5 text-white/28">Видали одне з аніме, щоб додати інше.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {!selected && (
                            <>
                                <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/[0.05] bg-[#0d1317] p-1">
                                    <SourceButton active={source === "bookmarks"} onClick={() => setSource("bookmarks")}>
                                        <Bookmark size={15} /> Закладки
                                    </SourceButton>
                                    <SourceButton active={source === "search"} onClick={() => setSource("search")}>
                                        <Search size={15} /> Пошук
                                    </SourceButton>
                                </div>

                                {source === "bookmarks" ? (
                                    <div className="mt-3">
                                        {bookmarksFetching && !bookmarks ? (
                                            <div className="grid min-h-[210px] place-items-center rounded-xl border border-white/[0.045] bg-[#0d1317] text-white/28">
                                                <LoaderCircle size={20} className="animate-spin" />
                                            </div>
                                        ) : bookmarks?.items.length ? (
                                            <div className="space-y-2">
                                                {bookmarks.items.map((bookmark) => (
                                                    <AnimeChoice
                                                        key={bookmark.id}
                                                        anime={bookmark.anime}
                                                        exists={existingAnimeIds.includes(bookmark.anime.id)}
                                                        meta="У закладках"
                                                        onSelect={() => chooseAnime(bookmark.anime)}
                                                    />
                                                ))}
                                                {bookmarks.totalPages > 1 && (
                                                    <div className="flex items-center justify-center gap-2 pt-2">
                                                        <button
                                                            type="button"
                                                            disabled={bookmarkPage <= 1 || bookmarksFetching}
                                                            onClick={() => setBookmarkPage((page) => Math.max(1, page - 1))}
                                                            className="h-8 rounded-lg border border-white/[0.05] bg-white/[0.03] px-3 text-[11px] text-white/42 transition hover:bg-white/[0.06] disabled:cursor-default disabled:opacity-25"
                                                        >
                                                            Назад
                                                        </button>
                                                        <span className="text-[11px] text-white/25">
                                                            {bookmarkPage} / {bookmarks.totalPages}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            disabled={bookmarkPage >= bookmarks.totalPages || bookmarksFetching}
                                                            onClick={() => setBookmarkPage((page) => page + 1)}
                                                            className="h-8 rounded-lg border border-white/[0.05] bg-white/[0.03] px-3 text-[11px] text-white/42 transition hover:bg-white/[0.06] disabled:cursor-default disabled:opacity-25"
                                                        >
                                                            Далі
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="grid min-h-[210px] place-items-center rounded-xl border border-dashed border-white/[0.055] bg-[#0d1317] px-5 text-center">
                                                <div>
                                                    <Bookmark size={24} className="mx-auto text-white/17" />
                                                    <p className="mt-2 text-[14px] text-white/48">Закладок поки немає</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSource("search")}
                                                        className="mt-2 cursor-pointer text-[12px] text-(--primary-3) hover:underline"
                                                    >
                                                        Знайти аніме через пошук
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-3">
                                        <div className="flex h-11 items-center gap-2 rounded-xl border border-white/[0.055] bg-[#171d22] px-3.5 focus-within:border-white/15">
                                            <Search size={18} className="text-white/35" />
                                            <input
                                                value={query}
                                                onChange={(event) => setQuery(event.target.value)}
                                                autoFocus
                                                placeholder="Пошук аніме"
                                                className="min-w-0 flex-1 bg-transparent text-[14px] text-white/86 outline-none placeholder:text-white/25"
                                            />
                                            {searchState.isFetching && <LoaderCircle size={16} className="animate-spin text-white/30" />}
                                        </div>

                                        {query.trim().length >= 2 && (
                                            <div className="mt-3 space-y-2">
                                                {searchResults.length ? (
                                                    searchResults.map((anime) => (
                                                        <AnimeChoice
                                                            key={anime.id}
                                                            anime={anime}
                                                            exists={existingAnimeIds.includes(anime.id)}
                                                            meta={`${anime.type} · ${anime.status}`}
                                                            onSelect={() => chooseAnime(anime)}
                                                        />
                                                    ))
                                                ) : !searchState.isFetching ? (
                                                    <div className="rounded-xl border border-dashed border-white/[0.05] px-4 py-8 text-center text-[13px] text-white/30">
                                                        Нічого не знайдено
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {selected && (
                            <div className="rounded-[16px] border border-white/[0.055] bg-[#0d1317] p-3.5">
                                <div className="flex items-center gap-3">
                                    <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-white/[0.04]">
                                        {imageSrc(selected.poster?.path) && (
                                            <Image src={imageSrc(selected.poster?.path)!} alt="" fill unoptimized sizes="56px" className="object-cover" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[15px] font-medium text-white/88">{selected.title}</p>
                                        <p className="mt-1 text-[12px] text-white/30">
                                            {selected.type} · {selected.status}{selectedFromBookmarks ? " · у закладках" : ""}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelected(null);
                                                setDescription("");
                                                setRemoveFromBookmarks(false);
                                            }}
                                            className="mt-2 text-[12px] text-(--primary-3) hover:underline"
                                        >
                                            Обрати інше
                                        </button>
                                    </div>
                                </div>

                                {selectedFromBookmarks && (
                                    <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.025] p-3">
                                        <input
                                            type="checkbox"
                                            checked={removeFromBookmarks}
                                            onChange={(event) => setRemoveFromBookmarks(event.target.checked)}
                                            className="mt-0.5 size-4 accent-[var(--primary)]"
                                        />
                                        <span>
                                            <span className="flex items-center gap-1.5 text-[13px] text-white/66">
                                                <Check size={14} /> Після додавання прибрати із закладок
                                            </span>
                                            <span className="mt-1 block text-[11px] leading-4 text-white/27">
                                                Аніме залишиться у цьому списку, але зникне з швидких закладок.
                                            </span>
                                        </span>
                                    </label>
                                )}

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

            <div className="flex shrink-0 justify-end gap-2 border-t border-white/[0.05] p-4 sm:px-5">
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

function SourceButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex h-9 items-center justify-center gap-2 rounded-lg text-[12px] font-medium transition",
                active ? "bg-white/[0.075] text-white/82" : "text-white/34 hover:bg-white/[0.035] hover:text-white/58",
            )}
        >
            {children}
        </button>
    );
}

function AnimeChoice({
    anime,
    exists,
    meta,
    onSelect,
}: {
    anime: SelectableAnime;
    exists: boolean;
    meta: string;
    onSelect: () => void;
}) {
    const poster = imageSrc(anime.poster?.path);
    return (
        <button
            type="button"
            disabled={exists}
            onClick={onSelect}
            className="flex w-full items-center gap-3 rounded-xl border border-white/[0.045] bg-[#0d1317] p-2.5 text-left transition hover:border-white/10 hover:bg-white/[0.035] disabled:cursor-not-allowed disabled:opacity-40"
        >
            <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-white/[0.04]">
                {poster && <Image src={poster} alt="" fill unoptimized sizes="48px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] text-white/82">{anime.title}</p>
                <p className="mt-1 text-[12px] text-white/30">{exists ? "Вже є у списку" : meta}</p>
            </div>
        </button>
    );
}
