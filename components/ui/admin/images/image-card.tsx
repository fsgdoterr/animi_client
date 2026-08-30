"use client";

import Image from "next/image";
import {
    Clapperboard,
    Copy,
    Link2,
    ShieldCheck,
    ShieldOff,
    Tags,
    Trash2,
    ListVideo,
    UserRound,
} from "lucide-react";
import { type ReactNode, useMemo } from "react";

import { Button } from "@/components/ui/buttons/button";
import { IconButton } from "@/components/ui/buttons/icon-button";
import type {
    ImageUsageEntity,
    ImageUsageUser,
    PrivateImage,
} from "@/lib/types/entites/image-type";
import { formatDate } from "@/lib/utils/format-date";

export default function ImageCard({
    image,
    onToggleAvatar,
    onDelete,
    disabled,
}: {
    image: PrivateImage;
    onToggleAvatar: () => void;
    onDelete: () => void;
    disabled: boolean;
}) {
    const animeItems = useMemo(
        () =>
            uniqueEntities([
                ...(image.animes ?? []),
                ...(image.animeAdditionalImages ?? []),
            ]),
        [image.animeAdditionalImages, image.animes],
    );
    const animeCount =
        (image._count?.animes ?? 0) + (image._count?.animeAdditionalImages ?? 0);

    async function copySource() {
        const value = image.sourceUrl ?? `/uploads/${image.path}`;
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            // Clipboard may be unavailable in an insecure context.
        }
    }

    return (
        <article className="group min-w-0 overflow-hidden rounded-xl border border-white/[0.055] bg-[#171d22] transition hover:border-white/[0.1]">
            <div className="relative aspect-[4/3] overflow-hidden bg-black/20">
                <Image
                    src={`/uploads/${encodeURIComponent(image.path)}`}
                    alt={`Зображення #${image.id}`}
                    fill
                    unoptimized
                    sizes="(max-width: 460px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.015]"
                />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
                    <span className="rounded-md bg-black/65 px-2 py-1 text-[11px] text-white/75 backdrop-blur-sm">
                        #{image.id}
                    </span>
                    {image.isAvatarAllowed && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300/15 bg-emerald-500/75 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                            <ShieldCheck size={12} />
                            Аватар
                        </span>
                    )}
                </div>
            </div>

            <div className="grid gap-3 p-3.5">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] text-white/35">
                        {formatDate(image.createdAt)}
                    </span>
                    <span className="text-[12px] text-white/30">
                        {getImageUsageCount(image)} привʼязок
                    </span>
                </div>

                <div className="grid gap-1.5">
                    <UsageRow
                        icon={<Clapperboard size={14} />}
                        label="Аніме"
                        items={animeItems}
                        total={animeCount}
                    />
                    <UsageRow
                        icon={<Tags size={14} />}
                        label="Жанри"
                        items={image.genres ?? []}
                        total={image._count?.genres ?? 0}
                    />
                    <UserUsageRow
                        items={image.avatars ?? []}
                        total={image._count?.avatars ?? 0}
                    />
                    <UsageRow
                        icon={<ListVideo size={14} />}
                        label="Списки"
                        items={image.playlistCovers ?? []}
                        total={image._count?.playlistCovers ?? 0}
                    />
                </div>

                {image.sourceUrl && (
                    <div className="flex min-w-0 items-center gap-2 rounded-md bg-white/[0.025] px-2.5 py-2 text-[12px] text-white/35">
                        <Link2 size={13} className="shrink-0" />
                        <span className="min-w-0 flex-1 truncate" title={image.sourceUrl}>
                            {image.sourceUrl}
                        </span>
                        <IconButton
                            type="button"
                            variant="ghost"
                            onClick={() => void copySource()}
                            className="size-7 shrink-0 rounded"
                            aria-label="Скопіювати URL"
                            title="Скопіювати URL"
                        >
                            <Copy size={13} />
                        </IconButton>
                    </div>
                )}

                <div className="grid grid-cols-[1fr_auto] gap-2 border-t border-white/[0.055] pt-3">
                    <Button
                        type="button"
                        color={image.isAvatarAllowed ? "red" : "green"}
                        variant="soft"
                        disabled={disabled}
                        onClick={onToggleAvatar}
                        className="h-9 min-w-0 px-3 text-[12px] font-normal"
                    >
                        {image.isAvatarAllowed ? (
                            <ShieldOff size={14} />
                        ) : (
                            <ShieldCheck size={14} />
                        )}
                        <span className="truncate">
                            {image.isAvatarAllowed
                                ? "Заборонити аватар"
                                : "Дозволити аватар"}
                        </span>
                    </Button>
                    <IconButton
                        type="button"
                        color="red"
                        disabled={disabled}
                        onClick={onDelete}
                        className="rounded-md"
                        aria-label={`Видалити зображення #${image.id}`}
                        title="Видалити зображення"
                    >
                        <Trash2 size={15} />
                    </IconButton>
                </div>
            </div>
        </article>
    );
}

function UsageRow({
    icon,
    label,
    items,
    total,
}: {
    icon: ReactNode;
    label: string;
    items: ImageUsageEntity[];
    total: number;
}) {
    return (
        <div className="flex min-w-0 items-center gap-2 text-[12px]">
            <span className="flex w-[68px] shrink-0 items-center gap-1.5 text-white/30">
                {icon}
                {label}
            </span>
            <span className="min-w-0 flex-1 truncate text-white/55">
                {total === 0
                    ? "—"
                    : `${items.map((item) => item.title).join(", ")}${
                          total > items.length ? ` +${total - items.length}` : ""
                      }`}
            </span>
        </div>
    );
}

function UserUsageRow({
    items,
    total,
}: {
    items: ImageUsageUser[];
    total: number;
}) {
    return (
        <div className="flex min-w-0 items-center gap-2 text-[12px]">
            <span className="flex w-[68px] shrink-0 items-center gap-1.5 text-white/30">
                <UserRound size={14} />
                Юзери
            </span>
            <span className="min-w-0 flex-1 truncate text-white/55">
                {total === 0
                    ? "—"
                    : `${items
                          .map((item) => item.displayName || item.username)
                          .join(", ")}${
                          total > items.length ? ` +${total - items.length}` : ""
                      }`}
            </span>
        </div>
    );
}

export function getImageUsageCount(image: PrivateImage) {
    return (
        (image._count?.avatars ?? 0) +
        (image._count?.genres ?? 0) +
        (image._count?.animes ?? 0) +
        (image._count?.animeAdditionalImages ?? 0) +
        (image._count?.playlistCovers ?? 0)
    );
}

function uniqueEntities(items: ImageUsageEntity[]) {
    return [...new Map(items.map((item) => [item.id, item])).values()];
}
