"use client";

import Image from "next/image";
import {
    Clapperboard,
    Copy,
    ImageIcon,
    Link2,
    Plus,
    Search,
    ShieldCheck,
    ShieldOff,
    Tags,
    Trash2,
    UserRound,
} from "lucide-react";
import { type ReactNode, useDeferredValue, useEffect, useMemo, useState } from "react";

import ErrorAlert from "@/components/ui/admin/shared/error-alert";
import ImageCreateModal from "@/components/ui/admin/images/image-create-modal";
import { Button } from "@/components/ui/buttons/button";
import { IconButton } from "@/components/ui/buttons/icon-button";
import { Select, type SelectOption } from "@/components/ui/dropdowns/select";
import { Input } from "@/components/ui/inputs/input";
import Pagination from "@/components/ui/pagination/pagination";
import {
    type ImageSort,
    type ImageUsageFilter,
    useDeleteImageMutation,
    useGetImagesQuery,
    useUpdateImageMutation,
} from "@/lib/store/animi/image-endpoints";
import type {
    ImageUsageEntity,
    ImageUsageUser,
    PrivateImage,
} from "@/lib/types/entites/image-type";
import { formatDate } from "@/lib/utils/format-date";

const PAGE_SIZE = 20;
type AvatarFilter = "all" | "allowed" | "not-allowed";

const usageOptions: SelectOption<ImageUsageFilter>[] = [
    { value: "all", label: "Усі зображення" },
    { value: "anime", label: "Використовуються в аніме" },
    { value: "genre", label: "Використовуються в жанрах" },
    { value: "avatar", label: "Встановлені як аватар" },
    { value: "unused", label: "Ніде не використовуються" },
];

const avatarOptions: SelectOption<AvatarFilter>[] = [
    { value: "all", label: "Будь-який статус" },
    { value: "allowed", label: "Дозволені як аватар" },
    { value: "not-allowed", label: "Не дозволені як аватар" },
];

const sortOptions: SelectOption<ImageSort>[] = [
    { value: "new", label: "Спочатку нові" },
    { value: "old", label: "Спочатку старі" },
];

export default function ImageManager() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [usage, setUsage] = useState<ImageUsageFilter>("all");
    const [avatarFilter, setAvatarFilter] = useState<AvatarFilter>("all");
    const [sort, setSort] = useState<ImageSort>("new");
    const [createOpen, setCreateOpen] = useState(false);
    const deferredSearch = useDeferredValue(search.trim());

    const { data, isLoading, isFetching, error } = useGetImagesQuery({
        search: deferredSearch || undefined,
        page,
        limit: PAGE_SIZE,
        usage,
        avatarAllowed:
            avatarFilter === "all" ? undefined : avatarFilter === "allowed",
        sort,
    });
    const [updateImage, updateState] = useUpdateImageMutation();
    const [deleteImage, deleteState] = useDeleteImageMutation();

    useEffect(() => {
        setPage(1);
    }, [deferredSearch, usage, avatarFilter, sort]);

    useEffect(() => {
        if (data?.totalPages && page > data.totalPages) {
            setPage(data.totalPages);
        }
    }, [data?.totalPages, page]);

    const images = data?.items ?? [];
    const showLoading = isLoading || (isFetching && !data);

    async function toggleAvatarAllowed(image: PrivateImage) {
        const nextValue = !image.isAvatarAllowed;
        if (!nextValue && (image._count?.avatars ?? 0) > 0) {
            const count = image._count?.avatars ?? 0;
            if (
                !window.confirm(
                    `Зображення використовується як аватар у ${count} користувачів. Якщо вимкнути дозвіл, їхні аватари буде відʼєднано. Продовжити?`,
                )
            ) {
                return;
            }
        }

        try {
            await updateImage({
                id: image.id,
                isAvatarAllowed: nextValue,
            }).unwrap();
        } catch {
            // Mutation error is shown on the page.
        }
    }

    async function removeImage(image: PrivateImage) {
        const usageCount = getUsageCount(image);
        const warning = usageCount
            ? ` Воно має ${usageCount} активних привʼязок; вони будуть очищені.`
            : "";

        if (
            !window.confirm(
                `Назавжди видалити зображення #${image.id}?${warning}`,
            )
        ) {
            return;
        }

        try {
            await deleteImage(image.id).unwrap();
        } catch {
            // Mutation error is shown on the page.
        }
    }

    return (
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
            <header className="flex shrink-0 flex-col gap-3 px-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 lg:min-h-[45px]">
                <div className="flex min-w-0 items-baseline gap-3">
                    <h1 className="truncate text-[24px] leading-tight text-white/92 sm:text-[26px] sm:leading-none">
                        Зображення
                    </h1>
                    {data?.totalCount !== undefined && (
                        <span className="hidden shrink-0 text-[14px] text-white/35 sm:inline">
                            {data.totalCount} усього
                        </span>
                    )}
                </div>
                <Button
                    type="button"
                    color="green"
                    onClick={() => setCreateOpen(true)}
                    className="w-full sm:w-auto"
                >
                    <Plus size={17} />
                    Додати зображення
                </Button>
            </header>

            <div className="mt-3 grid shrink-0 gap-2 lg:grid-cols-[minmax(280px,1fr)_230px_230px_190px]">
                <Input
                    icon={<Search size={19} strokeWidth={1.8} />}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="ID, користувач, аніме, жанр або URL"
                />
                <Select
                    value={usage}
                    options={usageOptions}
                    onChange={setUsage}
                    label="Використання"
                    className="w-full"
                />
                <Select
                    value={avatarFilter}
                    options={avatarOptions}
                    onChange={setAvatarFilter}
                    label="Аватар"
                    className="w-full"
                />
                <Select
                    value={sort}
                    options={sortOptions}
                    onChange={setSort}
                    label="Сортування"
                    className="w-full"
                />
            </div>

            <ErrorAlert error={error ?? updateState.error ?? deleteState.error} />

            <section className="mt-3 flex min-h-[280px] flex-1 flex-col overflow-hidden rounded-xl border border-white/[0.025] bg-[#11171c] shadow-[0_18px_60px_rgba(0,0,0,0.12)]">
                <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
                    {showLoading ? (
                        <ImageState icon={<ImageIcon size={26} />}>
                            Завантаження зображень...
                        </ImageState>
                    ) : images.length === 0 ? (
                        <ImageState icon={<ImageIcon size={28} />}>
                            Зображень не знайдено
                        </ImageState>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 min-[460px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                            {images.map((image) => (
                                <ImageCard
                                    key={image.id}
                                    image={image}
                                    onToggleAvatar={() => void toggleAvatarAllowed(image)}
                                    onDelete={() => void removeImage(image)}
                                    disabled={
                                        updateState.isLoading || deleteState.isLoading
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>

                <Pagination
                    page={page}
                    totalPages={Math.max(data?.totalPages ?? 1, 1)}
                    totalCount={data?.totalCount ?? 0}
                    isLoading={isFetching}
                    onPageChange={setPage}
                />
            </section>

            <ImageCreateModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
            />
        </div>
    );
}

function ImageCard({
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
        () => uniqueEntities([...(image.animes ?? []), ...(image.animeAdditionalImages ?? [])]),
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
                        {getUsageCount(image)} привʼязок
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

function ImageState({
    icon,
    children,
}: {
    icon: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-[14px] text-white/32">
            <span className="text-white/20">{icon}</span>
            {children}
        </div>
    );
}

function getUsageCount(image: PrivateImage) {
    return (
        (image._count?.avatars ?? 0) +
        (image._count?.genres ?? 0) +
        (image._count?.animes ?? 0) +
        (image._count?.animeAdditionalImages ?? 0)
    );
}

function uniqueEntities(items: ImageUsageEntity[]) {
    return [...new Map(items.map((item) => [item.id, item])).values()];
}
