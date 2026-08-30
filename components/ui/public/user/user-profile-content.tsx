"use client";

import Image from "next/image";
import Link from "next/link";
import {
    ArrowLeft,
    CalendarDays,
    Eye,
    ListPlus,
    LoaderCircle,
    MessageCircle,
    Plus,
    Star,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import PlaylistCreateModal, { PlaylistCreateForm } from "@/components/ui/public/user/playlist-create-modal";
import { useAppSelector } from "@/lib/hooks/redux";
import useDocumentScrollLock from "@/lib/hooks/use-document-scroll-lock";
import { useLazyGetPublicUserActivityQuery } from "@/lib/store/animi/public-endpoints";
import type {
    PublicPlaylistSummary,
    PublicUserActivityItem,
    PublicUserActivityResult,
    PublicUserProfile,
} from "@/lib/types/public";
import cn from "@/lib/utils/cn";
import { imageSrc } from "@/lib/utils/public-anime";

export default function UserProfileContent({
    profile,
    activity,
}: {
    profile: PublicUserProfile;
    activity: PublicUserActivityResult;
}) {
    const currentUser = useAppSelector((state) => state.auth.user);
    const [createOpen, setCreateOpen] = useState(false);
    const [mobileListsOpen, setMobileListsOpen] = useState(false);
    const [activityItems, setActivityItems] = useState(activity.items);
    const [activityPage, setActivityPage] = useState(activity.page);
    const [activityTotalPages, setActivityTotalPages] = useState(activity.totalPages);
    const [loadActivity, loadActivityState] = useLazyGetPublicUserActivityQuery();
    const isOwner = currentUser?.id === profile.user.id;
    const avatar = imageSrc(profile.user.avatar?.path);

    async function showMoreActivity() {
        if (loadActivityState.isFetching || activityPage >= activityTotalPages) return;
        try {
            const next = await loadActivity({
                username: profile.user.username,
                page: activityPage + 1,
                limit: activity.limit,
            }).unwrap();
            setActivityItems((current) => {
                const ids = new Set(current.map((item) => item.id));
                return [...current, ...next.items.filter((item) => !ids.has(item.id))];
            });
            setActivityPage(next.page);
            setActivityTotalPages(next.totalPages);
        } catch {
            // Keep already loaded activity visible if a later page fails.
        }
    }

    function openCreateModal() {
        setCreateOpen(true);
    }

    return (
        <div className="mx-auto w-full max-w-[1120px] px-4 pb-[160px] pt-5 sm:px-6 sm:pt-6 md:pb-16 md:pt-[116px] lg:px-8">
            <section className="relative overflow-hidden rounded-[22px] border border-white/[0.055] bg-[#10161b] shadow-[0_18px_60px_rgba(0,0,0,.2)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(228,95,58,.22),transparent_34%),radial-gradient(circle_at_72%_0%,rgba(82,130,175,.08),transparent_34%)]" />
                <div className="relative flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:px-6 sm:py-6">
                    <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.07] text-white/40 shadow-[0_10px_30px_rgba(0,0,0,.25)] sm:size-24">
                        {avatar ? (
                            <Image src={avatar} alt="" fill unoptimized sizes="96px" className="object-cover" />
                        ) : (
                            <span className="text-[30px] text-white/30">@</span>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-[24px] font-medium leading-tight text-white/95 sm:text-[28px]">
                            {profile.user.displayName || profile.user.username}
                        </h1>
                        <p className="mt-1 truncate text-[14px] text-white/38">@{profile.user.username}</p>
                        <div className="mt-3 flex items-center gap-2 text-[12px] text-white/32">
                            <CalendarDays size={14} />
                            На сайті з {formatMonthYear(profile.user.createdAt)}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:w-[250px]">
                        <Stat value={profile.stats.reviews} label="оцінок" icon={<Star size={14} />} />
                        <Stat value={profile.stats.comments} label="коментарів" icon={<MessageCircle size={14} />} />
                    </div>
                </div>
            </section>

            <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.75fr)_minmax(290px,.85fr)]">
                <section className="min-w-0">
                    <div className="mb-2.5 flex items-end justify-between gap-3 px-1">
                        <div>
                            <h2 className="text-[18px] font-medium text-white/88">Активність</h2>
                            <p className="mt-0.5 text-[12px] text-white/28">Останні дії користувача на сайті</p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[18px] border border-white/[0.055] bg-[#10161b]">
                        {activityItems.length ? (
                            <>
                                <div className="divide-y divide-white/[0.045]">
                                    {activityItems.map((item) => (
                                        <ActivityRow key={item.id} item={item} username={profile.user.username} />
                                    ))}
                                </div>

                                {activityPage < activityTotalPages && (
                                    <div className="border-t border-white/[0.045] p-3">
                                        <button
                                            type="button"
                                            onClick={() => void showMoreActivity()}
                                            disabled={loadActivityState.isFetching}
                                            className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.025] text-[13px] text-white/45 transition hover:bg-white/[0.055] hover:text-white/68 disabled:cursor-default disabled:opacity-50"
                                        >
                                            {loadActivityState.isFetching && <LoaderCircle size={15} className="animate-spin" />}
                                            Показати ще
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="grid min-h-[240px] place-items-center px-6 py-10 text-center">
                                <div>
                                    <div className="mx-auto grid size-12 place-items-center rounded-full bg-white/[0.035] text-white/20">
                                        <Eye size={21} />
                                    </div>
                                    <p className="mt-3 text-[14px] text-white/52">Активності поки немає</p>
                                    <p className="mt-1 text-[12px] text-white/26">Тут з’являться перегляди, оцінки, коментарі та зміни списків.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <aside className="hidden min-w-0 md:block">
                    <PlaylistSection
                        profile={profile}
                        isOwner={isOwner}
                        onCreate={openCreateModal}
                    />
                </aside>
            </div>

            <MobilePlaylistsPanel
                profile={profile}
                isOwner={isOwner}
                open={mobileListsOpen}
                onToggle={() => setMobileListsOpen((value) => !value)}
                onClose={() => setMobileListsOpen(false)}
            />

            {isOwner && (
                <PlaylistCreateModal
                    username={profile.user.username}
                    open={createOpen}
                    onClose={() => setCreateOpen(false)}
                />
            )}
        </div>
    );
}

function PlaylistSection({
    profile,
    isOwner,
    onCreate,
}: {
    profile: PublicUserProfile;
    isOwner: boolean;
    onCreate: () => void;
}) {
    return (
        <>
            <div className="mb-2.5 flex min-h-11 items-end justify-between gap-3 px-1">
                <div>
                    <h2 className="text-[18px] font-medium text-white/88">Списки</h2>
                    <p className="mt-0.5 text-[12px] text-white/28">
                        {profile.stats.playlists} списків · {profile.stats.listItems} аніме
                    </p>
                </div>
                {isOwner && (
                    <button
                        type="button"
                        onClick={onCreate}
                        className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-(--primary) px-3 text-[13px] font-medium text-white transition hover:bg-(--primary-3)"
                    >
                        <Plus size={15} />
                        Створити
                    </button>
                )}
            </div>

            <div className="rounded-[18px] border border-white/[0.055] bg-[#10161b] p-2.5">
                <PlaylistList profile={profile} isOwner={isOwner} onCreate={onCreate} />
            </div>
        </>
    );
}

function PlaylistList({
    profile,
    isOwner,
    onCreate,
}: {
    profile: PublicUserProfile;
    isOwner: boolean;
    onCreate: () => void;
}) {
    if (profile.playlists.length) {
        return (
            <div className="space-y-2.5">
                {profile.playlists.map((playlist) => (
                    <PlaylistCard key={playlist.id} username={profile.user.username} playlist={playlist} />
                ))}
            </div>
        );
    }

    return (
        <div className="grid min-h-[220px] place-items-center px-5 text-center">
            <div>
                <ListPlus size={25} className="mx-auto text-white/18" />
                <p className="mt-3 text-[14px] text-white/48">Списків поки немає</p>
                {isOwner && (
                    <button
                        type="button"
                        onClick={onCreate}
                        className="mt-3 cursor-pointer text-[13px] text-(--primary-3) hover:underline"
                    >
                        Створити перший список
                    </button>
                )}
            </div>
        </div>
    );
}

function MobilePlaylistsPanel({
    profile,
    isOwner,
    open,
    onToggle,
    onClose,
}: {
    profile: PublicUserProfile;
    isOwner: boolean;
    open: boolean;
    onToggle: () => void;
    onClose: () => void;
}) {
    const [portalReady, setPortalReady] = useState(false);
    const [panelMounted, setPanelMounted] = useState(open);
    const [shown, setShown] = useState(false);
    const [view, setView] = useState<"lists" | "create">("lists");
    const [imagePickerOpen, setImagePickerOpen] = useState(false);
    const emptyForeignProfile = !isOwner && profile.stats.playlists === 0;

    useEffect(() => setPortalReady(true), []);

    useEffect(() => {
        if (open) {
            setPanelMounted(true);
            let secondFrame = 0;
            const firstFrame = window.requestAnimationFrame(() => {
                secondFrame = window.requestAnimationFrame(() => setShown(true));
            });
            return () => {
                window.cancelAnimationFrame(firstFrame);
                if (secondFrame) window.cancelAnimationFrame(secondFrame);
            };
        }

        setShown(false);
        const timeout = window.setTimeout(() => {
            setPanelMounted(false);
            setView("lists");
        }, 180);
        return () => window.clearTimeout(timeout);
    }, [open]);

    useDocumentScrollLock(panelMounted);

    useEffect(() => {
        if (!panelMounted) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape" || imagePickerOpen) return;
            if (view === "create") setView("lists");
            else onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [imagePickerOpen, onClose, panelMounted, view]);

    if (!portalReady) return null;

    return createPortal(
        <div className="md:hidden">
            <div className="fixed inset-x-3 bottom-[calc(86px+env(safe-area-inset-bottom))] z-[90]">
                <button
                    type="button"
                    aria-expanded={open}
                    disabled={emptyForeignProfile}
                    onClick={onToggle}
                    className={cn(
                        "mx-auto flex h-12 w-full max-w-[560px] items-center justify-center gap-2 rounded-2xl border px-4 text-[14px] font-medium shadow-[0_14px_45px_rgba(0,0,0,.42)] backdrop-blur-xl transition active:scale-[0.99] disabled:active:scale-100",
                        emptyForeignProfile
                            ? "cursor-default border-white/[0.05] bg-[#151c22]/88 text-white/28 shadow-none"
                            : open
                                ? "cursor-pointer text-(--primary) [border-color:color-mix(in_srgb,var(--primary)_34%,transparent)] [background-color:color-mix(in_srgb,var(--primary)_12%,#151c22)]"
                                : "cursor-pointer border-white/[0.08] bg-[#151c22]/96 text-white/82",
                    )}
                >
                    {open ? <X size={17} /> : <ListPlus size={17} />}
                    {emptyForeignProfile ? "Списків немає" : open ? "Закрити списки" : "Списки"}
                    {!emptyForeignProfile && (
                        <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/55">
                            {profile.stats.playlists}
                        </span>
                    )}
                </button>
            </div>

            {panelMounted && (
                <>
                    <button
                        type="button"
                        aria-label="Закрити списки"
                        onClick={onClose}
                        className={cn(
                            "fixed inset-x-0 top-0 bottom-[calc(86px+env(safe-area-inset-bottom))] z-[81] bg-black/55 transition-[opacity,backdrop-filter] duration-200 ease-out",
                            shown ? "opacity-100 backdrop-blur-[2px]" : "opacity-0 backdrop-blur-none",
                        )}
                    />
                    <div
                        className={cn(
                            "fixed inset-x-2 top-2 bottom-[calc(142px+env(safe-area-inset-bottom))] z-[88] transition-[opacity,transform] duration-200 ease-[cubic-bezier(.2,.8,.2,1)]",
                            shown ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-[0.96] opacity-0",
                        )}
                    >
                        <div className="mx-auto flex h-full w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#10161b]/98 shadow-[0_28px_80px_rgba(0,0,0,.58)] backdrop-blur-2xl">
                            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.05] px-3 py-3">
                                <div className="flex min-w-0 items-center gap-2.5">
                                    {view === "create" && (
                                        <button
                                            type="button"
                                            onClick={() => setView("lists")}
                                            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl bg-white/[0.045] text-white/55 transition active:scale-95"
                                            aria-label="Назад до списків"
                                        >
                                            <ArrowLeft size={18} />
                                        </button>
                                    )}
                                    <div className="min-w-0">
                                        <p className="truncate text-[15px] font-medium text-white/90">
                                            {view === "create" ? "Новий список" : "Списки"}
                                        </p>
                                        <p className="mt-0.5 truncate text-[11px] text-white/34">
                                            {view === "create"
                                                ? "Створення нової добірки"
                                                : `${profile.stats.playlists} списків · ${profile.stats.listItems} аніме`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                    {view === "lists" && isOwner && (
                                        <button
                                            type="button"
                                            onClick={() => setView("create")}
                                            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-(--primary) px-3 text-[12px] font-medium text-white transition active:scale-[0.98]"
                                        >
                                            <Plus size={15} />
                                            Створити
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="grid size-9 cursor-pointer place-items-center rounded-xl bg-white/[0.045] text-white/55 transition active:scale-95"
                                        aria-label="Закрити списки"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
                                {view === "lists" ? (
                                    <PlaylistList
                                        profile={profile}
                                        isOwner={isOwner}
                                        onCreate={() => setView("create")}
                                    />
                                ) : (
                                    <PlaylistCreateForm
                                        username={profile.user.username}
                                        embedded
                                        onCancel={() => setView("lists")}
                                        onImagePickerOpenChange={setImagePickerOpen}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>,
        document.body,
    );
}

function Stat({ value, label, icon }: { value: number; label: string; icon: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-white/[0.05] bg-black/15 px-3 py-2.5 text-center backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1.5 text-[15px] font-medium text-white/78">
                <span className="text-white/35">{icon}</span>
                {value}
            </div>
            <p className="mt-0.5 truncate text-[10px] uppercase tracking-[.06em] text-white/25">{label}</p>
        </div>
    );
}

function PlaylistCard({
    username,
    playlist,
}: {
    username: string;
    playlist: PublicPlaylistSummary;
}) {
    const cover = imageSrc(playlist.image?.path || playlist.previewAnime?.poster?.path);
    return (
        <Link
            href={`/users/${encodeURIComponent(username)}/lists/${encodeURIComponent(playlist.slug)}`}
            className="group relative block min-h-[112px] overflow-hidden rounded-[15px] border border-white/[0.045] bg-[#0a0f12] transition hover:border-white/10"
        >
            {cover ? (
                <Image src={cover} alt="" fill unoptimized sizes="360px" className="object-cover opacity-55 transition duration-500 group-hover:scale-[1.025] group-hover:opacity-65" />
            ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(228,95,58,.22),transparent_38%),linear-gradient(145deg,#141c22,#090d10)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#080d10]/95 via-[#080d10]/72 to-[#080d10]/18" />
            <div className="relative z-10 flex min-h-[112px] flex-col justify-between p-3.5">
                <div>
                    <h3 className="line-clamp-2 text-[15px] font-medium leading-5 text-white/90">{playlist.title}</h3>
                    {playlist.description && (
                        <p className="mt-1 line-clamp-2 text-[12px] leading-4 text-white/42">{playlist.description}</p>
                    )}
                </div>
                <div className="mt-3">
                    <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] text-white/54 backdrop-blur-sm">
                        {playlist._count.items} аніме
                    </span>
                </div>
            </div>
        </Link>
    );
}

function ActivityRow({ item, username }: { item: PublicUserActivityItem; username: string }) {
    const animePoster = imageSrc(item.anime?.poster?.path);
    const content = activityText(item);

    return (
        <div className="relative min-h-[94px] overflow-hidden px-4 py-3.5 sm:px-5">
            {animePoster && (
                <>
                    <div className="absolute inset-y-0 right-0 w-[36%] opacity-25">
                        <Image src={animePoster} alt="" fill unoptimized sizes="260px" className="object-cover" />
                    </div>
                    <div className="absolute inset-y-0 right-0 w-[48%] bg-gradient-to-r from-[#10161b] via-[#10161b]/68 to-transparent" />
                </>
            )}
            <div className="relative z-10 flex min-w-0 items-start gap-3">
                <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-white/[0.05] bg-white/[0.035] text-white/35">
                    {activityIcon(item)}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[14px] leading-5 text-white/70">{content}</div>
                    {item.comment?.text && (
                        <p className="mt-1.5 line-clamp-2 max-w-[560px] text-[12px] leading-4 text-white/34">“{item.comment.text}”</p>
                    )}
                    {item.description && item.type === "PLAYLIST_ITEM_ADDED" && (
                        <p className="mt-1.5 line-clamp-2 max-w-[560px] text-[12px] leading-4 text-white/31">{item.description}</p>
                    )}
                    <p className="mt-2 text-[11px] text-white/22">{formatActivityDate(item.occurredAt)}</p>
                </div>
            </div>
        </div>
    );

    function activityText(activity: PublicUserActivityItem) {
        const animeLink = activity.anime ? (
            <Link href={`/anime/${activity.anime.slug}`} className="font-medium text-white/86 hover:text-(--primary-3)">
                {activity.anime.title}
            </Link>
        ) : null;
        const listLink = activity.playlist ? (
            <Link
                href={`/users/${encodeURIComponent(username)}/lists/${encodeURIComponent(activity.playlist.slug)}`}
                className="font-medium text-white/86 hover:text-(--primary-3)"
            >
                {activity.playlist.title}
            </Link>
        ) : null;

        switch (activity.type) {
            case "VIEW":
                return <>Переглянув {animeLink}</>;
            case "COMMENT":
                return <>Залишив коментар до {animeLink}</>;
            case "REVIEW":
                return <>Оцінив {animeLink} на <span className="font-medium text-(--yellow)">{activity.rating}/5</span></>;
            case "PLAYLIST_CREATED":
                return <>Створив список {listLink}</>;
            case "PLAYLIST_ITEM_ADDED":
                return <>Додав {animeLink} до {listLink}</>;
        }
    }
}

function activityIcon(item: PublicUserActivityItem) {
    switch (item.type) {
        case "VIEW":
            return <Eye size={17} />;
        case "COMMENT":
            return <MessageCircle size={17} />;
        case "REVIEW":
            return <Star size={17} />;
        case "PLAYLIST_CREATED":
        case "PLAYLIST_ITEM_ADDED":
            return <ListPlus size={17} />;
    }
}

function formatMonthYear(value: string) {
    return new Intl.DateTimeFormat("uk-UA", { month: "long", year: "numeric" }).format(new Date(value));
}

function formatActivityDate(value: string) {
    return new Intl.DateTimeFormat("uk-UA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}
