"use client";

import Image from "next/image";
import Link from "next/link";
import {
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    Check,
    ListPlus,
    LoaderCircle,
    Pencil,
    Plus,
    Trash2,
    UserRound,
    X,
} from "lucide-react";
import { useState } from "react";

import PlaylistAddAnimeModal from "@/components/ui/public/user/playlist-add-anime-modal";
import { useAppSelector } from "@/lib/hooks/redux";
import {
    useRemovePublicPlaylistItemMutation,
    useReorderPublicPlaylistItemsMutation,
    useUpdatePublicPlaylistItemMutation,
} from "@/lib/store/animi/public-endpoints";
import type { PublicPlaylistDetail, PublicPlaylistItem } from "@/lib/types/public";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { imageSrc } from "@/lib/utils/public-anime";

export default function PlaylistDetailContent({ playlist }: { playlist: PublicPlaylistDetail }) {
    const currentUser = useAppSelector((state) => state.auth.user);
    const [items, setItems] = useState(playlist.items);
    const [addOpen, setAddOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reorder, reorderState] = useReorderPublicPlaylistItemsMutation();
    const [removeItem, removeState] = useRemovePublicPlaylistItemMutation();
    const isOwner = currentUser?.id === playlist.user.id;
    const isFull = items.length >= 30;
    const cover = imageSrc(playlist.image?.path || items[0]?.anime.poster?.path);

    async function moveItem(index: number, direction: -1 | 1) {
        const target = index + direction;
        if (target < 0 || target >= items.length || reorderState.isLoading) return;
        const previous = items;
        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];
        setItems(next.map((item, order) => ({ ...item, order })));
        setError(null);
        try {
            await reorder({
                username: playlist.user.username,
                slug: playlist.slug,
                orderedItemIds: next.map((item) => item.id),
            }).unwrap();
        } catch (requestError) {
            setItems(previous);
            setError(getErrorMessage(requestError, "Не вдалося змінити порядок."));
        }
    }

    async function deleteItem(item: PublicPlaylistItem) {
        if (!window.confirm(`Видалити «${item.anime.title}» зі списку?`)) return;
        const previous = items;
        setItems((current) => current.filter((entry) => entry.id !== item.id).map((entry, order) => ({ ...entry, order })));
        setError(null);
        try {
            await removeItem({
                username: playlist.user.username,
                slug: playlist.slug,
                itemId: item.id,
            }).unwrap();
        } catch (requestError) {
            setItems(previous);
            setError(getErrorMessage(requestError, "Не вдалося видалити аніме зі списку."));
        }
    }

    return (
        <div className="mx-auto w-full max-w-[1120px] px-4 pb-12 pt-5 sm:px-6 sm:pt-6 md:pb-16 md:pt-[116px] lg:px-8">
            <Link
                href={`/users/${encodeURIComponent(playlist.user.username)}`}
                className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-white/36 transition hover:text-white/68"
            >
                <ArrowLeft size={15} />
                Профіль @{playlist.user.username}
            </Link>

            <section className="relative min-h-[230px] overflow-hidden rounded-[22px] border border-white/[0.055] bg-[#10161b] shadow-[0_18px_60px_rgba(0,0,0,.22)] sm:min-h-[260px]">
                {cover ? (
                    <Image src={cover} alt="" fill unoptimized sizes="1120px" className="object-cover opacity-45" />
                ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(228,95,58,.24),transparent_36%),linear-gradient(145deg,#172129,#0b1014)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0c1115]/98 via-[#0c1115]/78 to-[#0c1115]/25" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1115]/82 via-transparent to-transparent" />

                <div className="relative z-10 flex min-h-[230px] flex-col justify-end p-5 sm:min-h-[260px] sm:p-7">
                    <div className="flex items-end justify-between gap-5">
                        <div className="min-w-0 max-w-[760px]">
                            <div className="mb-3 flex items-center gap-2 text-[12px] text-white/38">
                                <UserAvatar playlist={playlist} />
                                <Link href={`/users/${encodeURIComponent(playlist.user.username)}`} className="hover:text-white/70">
                                    {playlist.user.displayName || `@${playlist.user.username}`}
                                </Link>
                                <span>·</span>
                                <span>{items.length}/30 аніме</span>
                            </div>
                            <h1 className="text-[27px] font-medium leading-tight text-white/95 sm:text-[34px]">{playlist.title}</h1>
                            {playlist.description && (
                                <p className="mt-3 max-w-[720px] text-[14px] leading-6 text-white/52">{playlist.description}</p>
                            )}
                        </div>

                        {isOwner && (
                            <button
                                type="button"
                                onClick={() => setAddOpen(true)}
                                disabled={isFull}
                                className="hidden h-10 shrink-0 items-center gap-2 rounded-xl bg-(--primary) px-4 text-[14px] font-medium text-white transition hover:bg-(--primary-3) disabled:cursor-not-allowed disabled:opacity-45 sm:flex"
                            >
                                <Plus size={16} />
                                {isFull ? "Ліміт 30 аніме" : "Додати аніме"}
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {isOwner && (
                <button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    disabled={isFull}
                    className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-(--primary) text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-45 sm:hidden"
                >
                    <Plus size={16} />
                    {isFull ? "Ліміт 30 аніме" : "Додати аніме"}
                </button>
            )}

            <div className="mt-5">
                <div className="mb-2.5 flex items-end justify-between gap-3 px-1">
                    <div>
                        <h2 className="text-[18px] font-medium text-white/88">Аніме у списку</h2>
                        <p className="mt-0.5 text-[12px] text-white/28">
                            {isOwner ? "Змінюй порядок, редагуй примітки або видаляй тайтли." : "Порядок визначив автор списку."}
                        </p>
                    </div>
                    {reorderState.isLoading && (
                        <span className="flex items-center gap-1.5 text-[12px] text-white/30">
                            <LoaderCircle size={13} className="animate-spin" /> Зберігаємо порядок
                        </span>
                    )}
                </div>

                {error && (
                    <div className="mb-3 rounded-xl border border-red-400/15 bg-red-500/[0.07] px-3.5 py-2.5 text-[13px] text-red-200/85">
                        {error}
                    </div>
                )}

                {items.length ? (
                    <div className="space-y-2.5">
                        {items.map((item, index) => (
                            <PlaylistItemRow
                                key={item.id}
                                item={item}
                                index={index}
                                total={items.length}
                                isOwner={isOwner}
                                busy={reorderState.isLoading || removeState.isLoading}
                                username={playlist.user.username}
                                slug={playlist.slug}
                                onMove={moveItem}
                                onDelete={deleteItem}
                                onUpdated={(updated) =>
                                    setItems((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)))
                                }
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid min-h-[280px] place-items-center rounded-[18px] border border-dashed border-white/[0.055] bg-[#10161b]/55 px-6 text-center">
                        <div>
                            <ListPlus size={28} className="mx-auto text-white/18" />
                            <p className="mt-3 text-[15px] text-white/48">Список поки порожній</p>
                            {isOwner && (
                                <button
                                    type="button"
                                    onClick={() => setAddOpen(true)}
                                    disabled={isFull}
                                    className="mt-3 text-[13px] text-(--primary-3) hover:underline"
                                >
                                    Додати перше аніме
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {isOwner && (
                <PlaylistAddAnimeModal
                    username={playlist.user.username}
                    slug={playlist.slug}
                    open={addOpen}
                    existingAnimeIds={items.map((item) => item.anime.id)}
                    onClose={() => setAddOpen(false)}
                    onCreated={(item) => setItems((current) => [...current, item])}
                />
            )}
        </div>
    );
}

function PlaylistItemRow({
    item,
    index,
    total,
    isOwner,
    busy,
    username,
    slug,
    onMove,
    onDelete,
    onUpdated,
}: {
    item: PublicPlaylistItem;
    index: number;
    total: number;
    isOwner: boolean;
    busy: boolean;
    username: string;
    slug: string;
    onMove: (index: number, direction: -1 | 1) => void;
    onDelete: (item: PublicPlaylistItem) => void;
    onUpdated: (item: PublicPlaylistItem) => void;
}) {
    const poster = imageSrc(item.anime.poster?.path);
    const [editing, setEditing] = useState(false);
    const [description, setDescription] = useState(item.description ?? "");
    const [updateItem, updateState] = useUpdatePublicPlaylistItemMutation();
    const [error, setError] = useState<string | null>(null);

    async function saveDescription() {
        setError(null);
        try {
            const updated = await updateItem({
                username,
                slug,
                itemId: item.id,
                description: description.trim() || undefined,
            }).unwrap();
            onUpdated(updated);
            setEditing(false);
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Не вдалося зберегти примітку."));
        }
    }

    return (
        <article className="overflow-hidden rounded-[17px] border border-white/[0.055] bg-[#10161b] transition hover:border-white/[0.085]">
            <div className="flex min-w-0 gap-3 p-3 sm:gap-4 sm:p-4">
                <div className="flex w-8 shrink-0 flex-col items-center gap-1.5 pt-1 text-white/28">
                    <span className="text-[12px] font-medium">{String(index + 1).padStart(2, "0")}</span>
                    {isOwner && (
                        <div className="mt-1 flex flex-col gap-1">
                            <OrderButton disabled={busy || index === 0} onClick={() => onMove(index, -1)} label="Вище">
                                <ArrowUp size={13} />
                            </OrderButton>
                            <OrderButton disabled={busy || index === total - 1} onClick={() => onMove(index, 1)} label="Нижче">
                                <ArrowDown size={13} />
                            </OrderButton>
                        </div>
                    )}
                </div>

                <Link href={`/anime/${item.anime.slug}`} className="relative h-[112px] w-[78px] shrink-0 overflow-hidden rounded-xl bg-white/[0.04] sm:h-[126px] sm:w-[88px]">
                    {poster ? (
                        <Image src={poster} alt="" fill unoptimized sizes="88px" className="object-cover transition duration-300 hover:scale-[1.03]" />
                    ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(228,95,58,.2),transparent_45%)]" />
                    )}
                </Link>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <Link href={`/anime/${item.anime.slug}`} className="line-clamp-2 text-[16px] font-medium leading-5 text-white/88 transition hover:text-(--primary-3)">
                                {item.anime.title}
                            </Link>
                            <p className="mt-1 text-[11px] uppercase tracking-[.05em] text-white/25">{item.anime.type} · {item.anime.status}</p>
                        </div>

                        {isOwner && (
                            <div className="flex shrink-0 gap-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDescription(item.description ?? "");
                                        setEditing((value) => !value);
                                    }}
                                    className="grid size-8 place-items-center rounded-lg bg-white/[0.04] text-white/32 transition hover:bg-white/[0.075] hover:text-white/65"
                                    title="Редагувати примітку"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(item)}
                                    className="grid size-8 place-items-center rounded-lg bg-white/[0.04] text-white/28 transition hover:bg-red-500/10 hover:text-red-300/80"
                                    title="Видалити зі списку"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {!editing && (
                        <p className="mt-3 line-clamp-3 max-w-[720px] text-[13px] leading-5 text-white/40">
                            {item.description || (isOwner ? "Примітки немає. Її можна додати кнопкою редагування." : "Автор не залишив примітку.")}
                        </p>
                    )}

                    {editing && (
                        <div className="mt-3">
                            <textarea
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                maxLength={2000}
                                rows={3}
                                className="w-full resize-y rounded-xl border border-white/[0.055] bg-[#171d22] px-3 py-2.5 text-[13px] leading-5 text-white/80 outline-none focus:border-white/15"
                                placeholder="Моя примітка до цього аніме"
                            />
                            {error && <p className="mt-1.5 text-[12px] text-red-300/80">{error}</p>}
                            <div className="mt-2 flex justify-end gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setEditing(false)}
                                    disabled={updateState.isLoading}
                                    className="grid size-8 place-items-center rounded-lg bg-white/[0.04] text-white/38 hover:bg-white/[0.07] disabled:opacity-50"
                                >
                                    <X size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={saveDescription}
                                    disabled={updateState.isLoading}
                                    className="grid size-8 place-items-center rounded-lg bg-(--primary) text-white transition hover:bg-(--primary-3) disabled:opacity-50"
                                >
                                    {updateState.isLoading ? <LoaderCircle size={14} className="animate-spin" /> : <Check size={14} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}

function OrderButton({
    disabled,
    onClick,
    label,
    children,
}: {
    disabled: boolean;
    onClick: () => void;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            title={label}
            className="grid size-7 place-items-center rounded-lg border border-white/[0.04] bg-white/[0.035] text-white/30 transition hover:bg-white/[0.075] hover:text-white/65 disabled:cursor-default disabled:opacity-20"
        >
            {children}
        </button>
    );
}

function UserAvatar({ playlist }: { playlist: PublicPlaylistDetail }) {
    const avatar = imageSrc(playlist.user.avatar?.path);
    return (
        <span className="relative grid size-6 shrink-0 place-items-center overflow-hidden rounded-full bg-white/[0.06] text-white/35">
            {avatar ? <Image src={avatar} alt="" fill unoptimized sizes="24px" className="object-cover" /> : <UserRound size={13} />}
        </span>
    );
}
