"use client";

import { Bookmark, BookmarkCheck, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAppSelector } from "@/lib/hooks/redux";
import {
    useAddPublicBookmarkMutation,
    useGetPublicBookmarkIdsQuery,
    useRemovePublicBookmarkMutation,
} from "@/lib/store/animi/public-endpoints";
import cn from "@/lib/utils/cn";

export default function BookmarkButton({
    animeId,
    variant = "icon",
    className,
}: {
    animeId: number;
    variant?: "icon" | "action";
    className?: string;
}) {
    const user = useAppSelector((state) => state.auth.user);
    const { data: bookmarkIds } = useGetPublicBookmarkIdsQuery(undefined, { skip: !user });
    const [addBookmark, addState] = useAddPublicBookmarkMutation();
    const [removeBookmark, removeState] = useRemovePublicBookmarkMutation();
    const actualBookmarked = useMemo(() => bookmarkIds?.includes(animeId) ?? false, [animeId, bookmarkIds]);
    const [optimisticValue, setOptimisticValue] = useState<boolean | null>(null);
    const busy = addState.isLoading || removeState.isLoading;
    const bookmarked = optimisticValue ?? actualBookmarked;

    useEffect(() => {
        setOptimisticValue(null);
    }, [actualBookmarked]);

    async function toggle(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        event.stopPropagation();

        if (!user) {
            window.dispatchEvent(new Event("animi:open-auth"));
            return;
        }
        if (busy) return;

        const next = !bookmarked;
        setOptimisticValue(next);
        try {
            if (next) await addBookmark(animeId).unwrap();
            else await removeBookmark(animeId).unwrap();
        } catch {
            setOptimisticValue(null);
        }
    }

    if (variant === "action") {
        return (
            <button
                type="button"
                onClick={toggle}
                disabled={busy}
                aria-pressed={bookmarked}
                className={cn(
                    "flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border text-[13px] font-medium transition disabled:cursor-wait disabled:opacity-65",
                    bookmarked
                        ? "border-[color-mix(in_srgb,var(--primary)_34%,transparent)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-(--primary-3)"
                        : "border-white/[0.065] bg-white/[0.035] text-white/62 hover:bg-white/[0.065] hover:text-white/82",
                    className,
                )}
            >
                {busy ? (
                    <LoaderCircle size={16} className="animate-spin" />
                ) : bookmarked ? (
                    <BookmarkCheck size={16} />
                ) : (
                    <Bookmark size={16} />
                )}
                {bookmarked ? "Відстежується" : "Стежити"}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={toggle}
            disabled={busy}
            aria-label={bookmarked ? "Прибрати із закладок" : "Додати в закладки"}
            aria-pressed={bookmarked}
            title={bookmarked ? "Прибрати із закладок" : "Стежити"}
            className={cn(
                "grid size-9 cursor-pointer place-items-center rounded-xl border border-white/10 bg-black/45 text-white/75 shadow-[0_8px_22px_rgba(0,0,0,.3)] backdrop-blur-md transition hover:bg-black/65 hover:text-white disabled:cursor-wait disabled:opacity-65",
                bookmarked && "border-[color-mix(in_srgb,var(--primary)_35%,transparent)] bg-[color-mix(in_srgb,var(--primary)_22%,rgba(0,0,0,.62))] text-(--primary-3)",
                className,
            )}
        >
            {busy ? (
                <LoaderCircle size={16} className="animate-spin" />
            ) : bookmarked ? (
                <BookmarkCheck size={17} fill="currentColor" />
            ) : (
                <Bookmark size={17} />
            )}
        </button>
    );
}
