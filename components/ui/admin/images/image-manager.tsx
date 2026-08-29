"use client";

import { ImageIcon, Plus, Search } from "lucide-react";
import { type ReactNode, useDeferredValue, useEffect, useState } from "react";

import ErrorAlert from "@/components/ui/admin/shared/error-alert";
import ImageCard, { getImageUsageCount } from "@/components/ui/admin/images/image-card";
import ImageCreateModal from "@/components/ui/admin/images/image-create-modal";
import { Button } from "@/components/ui/buttons/button";
import { Select, type SelectOption } from "@/components/ui/dropdowns/select";
import { Input } from "@/components/ui/inputs/input";
import Pagination from "@/components/ui/pagination/pagination";
import { useClampPage } from "@/lib/hooks/use-admin-list-controls";
import {
    type ImageSort,
    type ImageUsageFilter,
    useDeleteImageMutation,
    useGetImagesQuery,
    useUpdateImageMutation,
} from "@/lib/store/animi/image-endpoints";
import type { PrivateImage } from "@/lib/types/entites/image-type";

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

    useClampPage(page, data?.totalPages, setPage);

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
        const usageCount = getImageUsageCount(image);
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

