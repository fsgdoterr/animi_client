"use client";

import Image from "next/image";
import Link from "next/link";
import {
    ChevronLeft,
    ChevronRight,
    CornerDownRight,
    LoaderCircle,
    MessageCircle,
    ShieldCheck,
    ThumbsDown,
    ThumbsUp,
    UserRound,
} from "lucide-react";
import { useState } from "react";

import { useAppSelector } from "@/lib/hooks/redux";
import {
    useCreatePublicAnimeCommentMutation,
    useGetPublicAnimeCommentsQuery,
    useReactPublicAnimeCommentMutation,
} from "@/lib/store/animi/public-endpoints";
import { UserRole } from "@/lib/constants/permissions";
import type { PrivateUser } from "@/lib/types/entites/user";
import type {
    PublicAnimeComment,
    PublicCommentReplyTarget,
    PublicCommentUser,
} from "@/lib/types/public";
import cn from "@/lib/utils/cn";
import { imageSrc } from "@/lib/utils/public-anime";

export default function AnimeComments({ slug }: { slug: string }) {
    const user = useAppSelector((state) => state.auth.user);
    const [sort, setSort] = useState<"new" | "old" | "top">("new");
    const [page, setPage] = useState(1);
    const [text, setText] = useState("");
    const { data, isFetching } = useGetPublicAnimeCommentsQuery({ slug, page, limit: 15, sort });
    const [createComment, createState] = useCreatePublicAnimeCommentMutation();
    const [react] = useReactPublicAnimeCommentMutation();

    async function submit(parentId?: number, value = text) {
        const normalized = value.trim();
        if (!user || !normalized || createState.isLoading) return false;
        try {
            await createComment({ slug, text: normalized, parentId }).unwrap();
            if (!parentId) {
                setText("");
                setPage(1);
            }
            return true;
        } catch {
            return false;
        }
    }

    async function handleReaction(commentId: number, type: "LIKE" | "DISLIKE") {
        if (!user) return;
        try {
            await react({ slug, commentId, type }).unwrap();
        } catch {}
    }

    return (
        <section className="mx-auto w-full max-w-[1120px] px-4 pb-10 pt-3 sm:px-6 lg:px-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-[19px] font-medium text-white/88">Коментарі</h2>
                    <p className="mt-0.5 text-[12px] text-white/28">
                        {data?.totalCount ? `${data.totalCount} обговорень` : "Обговорення аніме"}
                    </p>
                </div>
                <div className="flex rounded-xl border border-white/[0.05] bg-white/[0.025] p-1">
                    {(["top", "new", "old"] as const).map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => {
                                setSort(value);
                                setPage(1);
                            }}
                            className={cn(
                                "cursor-pointer rounded-lg px-3 py-1.5 text-[11px] transition",
                                sort === value ? "bg-white/[0.08] text-white/76" : "text-white/28 hover:text-white/55",
                            )}
                        >
                            {value === "top" ? "Кращі" : value === "new" ? "Нові" : "Старі"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-3">
                <Avatar user={user} />
                <div className="min-w-0 flex-1">
                    <textarea
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        disabled={!user}
                        placeholder={user ? "Напишіть коментар…" : "Увійдіть, щоб залишити коментар"}
                        rows={3}
                        className="min-h-[92px] w-full resize-y rounded-2xl border border-white/[0.055] bg-[#10161b] px-4 py-3 text-[13px] leading-relaxed text-white/72 outline-none transition placeholder:text-white/22 focus:border-white/12 disabled:cursor-not-allowed disabled:opacity-65"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setText("")}
                            disabled={!text}
                            className="cursor-pointer rounded-lg px-3 py-2 text-[11px] text-white/30 transition hover:text-white/55 disabled:cursor-default disabled:opacity-30"
                        >
                            Скасувати
                        </button>
                        <button
                            type="button"
                            onClick={() => submit()}
                            disabled={!user || !text.trim() || createState.isLoading}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-(--primary) px-3.5 py-2 text-[11px] font-medium text-white transition hover:brightness-110 disabled:cursor-default disabled:opacity-45"
                        >
                            {createState.isLoading && <LoaderCircle size={13} className="animate-spin" />}
                            Відправити
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-7 space-y-5">
                {isFetching && !data ? (
                    <div className="grid min-h-32 place-items-center text-white/24"><LoaderCircle className="animate-spin" /></div>
                ) : data?.items.length ? (
                    data.items.map((comment) => (
                        <CommentThread
                            key={comment.id}
                            comment={comment}
                            canInteract={Boolean(user)}
                            onReply={submit}
                            onReaction={handleReaction}
                        />
                    ))
                ) : (
                    <div className="rounded-2xl border border-dashed border-white/[0.06] py-12 text-center">
                        <MessageCircle size={24} className="mx-auto text-white/16" />
                        <p className="mt-2 text-[13px] text-white/34">Поки що ніхто не коментував.</p>
                    </div>
                )}
            </div>

            {(data?.totalPages ?? 1) > 1 && (
                <div className="mt-7 flex items-center justify-center gap-3">
                    <PageButton disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                        <ChevronLeft size={15} />
                    </PageButton>
                    <span className="text-[11px] text-white/30">{page} / {data?.totalPages}</span>
                    <PageButton disabled={page >= (data?.totalPages ?? 1)} onClick={() => setPage((value) => value + 1)}>
                        <ChevronRight size={15} />
                    </PageButton>
                </div>
            )}
        </section>
    );
}

function CommentThread({
    comment,
    canInteract,
    onReply,
    onReaction,
}: {
    comment: PublicAnimeComment;
    canInteract: boolean;
    onReply: (parentId: number, text: string) => Promise<boolean>;
    onReaction: (commentId: number, type: "LIKE" | "DISLIKE") => Promise<void>;
}) {
    const [visibleReplies, setVisibleReplies] = useState(3);
    const hiddenReplies = Math.max(0, comment.replies.length - visibleReplies);

    return (
        <div>
            <CommentEntry
                comment={comment}
                canInteract={canInteract}
                onReply={onReply}
                onReaction={onReaction}
            />

            {comment.replies.length > 0 && (
                <div className="ml-5 mt-4 space-y-4 border-l border-white/[0.045] pl-4 sm:ml-9 sm:pl-5">
                    {comment.replies.slice(0, visibleReplies).map((reply) => (
                        <CommentEntry
                            key={reply.id}
                            comment={reply}
                            canInteract={canInteract}
                            onReply={onReply}
                            onReaction={onReaction}
                            nested
                        />
                    ))}
                    {hiddenReplies > 0 && (
                        <button
                            type="button"
                            onClick={() => setVisibleReplies((value) => Math.min(comment.replies.length, value + 5))}
                            className="ml-11 flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] text-(--primary-3) transition hover:bg-white/[0.03] hover:text-(--primary)"
                        >
                            Показати ще {Math.min(5, hiddenReplies)} {hiddenReplies === 1 ? "відповідь" : "відповідей"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function CommentEntry({
    comment,
    canInteract,
    onReply,
    onReaction,
    nested = false,
}: {
    comment: PublicAnimeComment;
    canInteract: boolean;
    onReply: (parentId: number, text: string) => Promise<boolean>;
    onReaction: (commentId: number, type: "LIKE" | "DISLIKE") => Promise<void>;
    nested?: boolean;
}) {
    const [replyOpen, setReplyOpen] = useState(false);
    const [replyText, setReplyText] = useState("");

    async function sendReply() {
        if (await onReply(comment.id, replyText)) {
            setReplyText("");
            setReplyOpen(false);
        }
    }

    return (
        <div id={`comment-${comment.id}`} className="flex scroll-mt-24 gap-3 rounded-xl transition-colors">
            <Avatar user={comment.user} />
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Link
                        href={`/users/${encodeURIComponent(comment.user.username)}`}
                        className="text-[12px] font-medium text-white/70 transition hover:text-(--primary-3)"
                    >
                        {comment.user.displayName || comment.user.username}
                    </Link>
                    {comment.user.displayName && (
                        <Link
                            href={`/users/${encodeURIComponent(comment.user.username)}`}
                            className="text-[10px] text-white/24 transition hover:text-(--primary-3)"
                        >
                            @{comment.user.username}
                        </Link>
                    )}
                    <RoleBadge role={comment.user.role} />
                    <span className="text-[10px] text-white/22">{relativeDate(comment.createdAt)}</span>
                </div>

                {nested && comment.replyTo && <ReplyReference replyTo={comment.replyTo} />}

                <p className="mt-1.5 whitespace-pre-line text-[12px] leading-[1.55] text-white/58">{comment.text}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-white/25">
                    <ReactionButton label="Подобається" onClick={() => onReaction(comment.id, "LIKE")} disabled={!canInteract}>
                        <ThumbsUp size={13} /> {comment.likes}
                    </ReactionButton>
                    <ReactionButton label="Не подобається" onClick={() => onReaction(comment.id, "DISLIKE")} disabled={!canInteract}>
                        <ThumbsDown size={13} /> {comment.dislikes}
                    </ReactionButton>
                    {canInteract && (
                        <button
                            type="button"
                            onClick={() => setReplyOpen((value) => !value)}
                            className="inline-flex cursor-pointer items-center gap-1 transition hover:text-white/50"
                        >
                            <CornerDownRight size={13} /> Відповісти
                        </button>
                    )}
                </div>

                {replyOpen && (
                    <div className="mt-3 rounded-xl border border-white/[0.045] bg-white/[0.018] p-2.5">
                        <div className="mb-2 flex items-center gap-1.5 text-[10px] text-white/30">
                            <CornerDownRight size={12} />
                            Відповідь для <span className="text-(--primary)">@{comment.user.username}</span>
                        </div>
                        <textarea
                            value={replyText}
                            onChange={(event) => setReplyText(event.target.value)}
                            rows={2}
                            autoFocus
                            placeholder="Ваша відповідь…"
                            className="min-h-[64px] w-full resize-y rounded-xl border border-white/[0.055] bg-[#0d1216] px-3 py-2 text-[12px] text-white/65 outline-none placeholder:text-white/20 focus:border-white/12"
                        />
                        <div className="mt-2 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setReplyOpen(false);
                                    setReplyText("");
                                }}
                                className="cursor-pointer rounded-lg px-2.5 py-1.5 text-[10px] text-white/28 transition hover:text-white/50"
                            >
                                Скасувати
                            </button>
                            <button
                                type="button"
                                onClick={sendReply}
                                disabled={!replyText.trim()}
                                className="cursor-pointer rounded-lg bg-(--primary) px-3 py-1.5 text-[10px] text-white transition hover:brightness-110 disabled:cursor-default disabled:opacity-40"
                            >
                                Відповісти
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ReplyReference({ replyTo }: { replyTo: PublicCommentReplyTarget }) {
    const preview = replyTo.text.replace(/\s+/g, " ").trim();

    return (
        <button
            type="button"
            onClick={() => scrollToComment(replyTo.id)}
            title={preview}
            className="mt-1.5 flex max-w-full cursor-pointer items-center gap-1.5 rounded-lg border border-white/[0.045] bg-white/[0.022] px-2 py-1 text-left text-[10px] text-white/28 transition hover:bg-white/[0.045] hover:text-white/42"
        >
            <CornerDownRight size={11} className="shrink-0" />
            <span className="shrink-0 font-medium text-(--primary)">@{replyTo.user.username}</span>
            <span className="truncate">{preview}</span>
        </button>
    );
}

function RoleBadge({ role }: { role: UserRole }) {
    if (role === UserRole.USER) return null;

    const label = {
        [UserRole.MODER]: "Модератор",
        [UserRole.ADMIN]: "Адмін",
        [UserRole.SUPER_ADMIN]: "Супер адмін",
        [UserRole.USER]: "",
    }[role];

    const className = {
        [UserRole.MODER]: "border-sky-400/20 bg-sky-400/[0.08] text-sky-300/75",
        [UserRole.ADMIN]: "[border-color:color-mix(in_srgb,var(--primary)_24%,transparent)] [background-color:color-mix(in_srgb,var(--primary)_9%,transparent)] text-(--primary-3)",
        [UserRole.SUPER_ADMIN]: "border-amber-400/[0.22] bg-amber-400/[0.08] text-amber-300/80",
        [UserRole.USER]: "",
    }[role];

    return (
        <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-medium", className)}>
            <ShieldCheck size={10} />
            {label}
        </span>
    );
}

function ReactionButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled: boolean; children: React.ReactNode }) {
    return (
        <button
            type="button"
            aria-label={label}
            onClick={onClick}
            disabled={disabled}
            className="inline-flex cursor-pointer items-center gap-1 transition hover:text-white/50 disabled:cursor-default"
        >
            {children}
        </button>
    );
}

function Avatar({ user }: { user: PublicCommentUser | PrivateUser | null }) {
    const avatar = user && "avatar" in user ? imageSrc(user.avatar?.path) : null;
    return (
        <span className="relative grid size-8 shrink-0 place-items-center overflow-hidden rounded-full border border-white/[0.06] bg-white/[0.06] text-white/40">
            {avatar ? <Image src={avatar} alt="" fill unoptimized sizes="32px" className="object-cover" /> : <UserRound size={16} />}
        </span>
    );
}

function PageButton({ disabled, onClick, children }: { disabled: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className="grid size-8 cursor-pointer place-items-center rounded-lg bg-white/[0.04] text-white/40 transition hover:bg-white/[0.08] disabled:cursor-default disabled:opacity-25"
        >
            {children}
        </button>
    );
}

function scrollToComment(id: number) {
    const element = document.getElementById(`comment-${id}`);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.animate(
        [
            { backgroundColor: "rgba(228, 95, 58, 0.14)" },
            { backgroundColor: "rgba(228, 95, 58, 0)" },
        ],
        { duration: 1100, easing: "ease-out" },
    );
}

function relativeDate(value: string) {
    const diff = Date.now() - new Date(value).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "щойно";
    if (minutes < 60) return `${minutes} хв тому`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} год тому`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} дн тому`;
    return new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}
