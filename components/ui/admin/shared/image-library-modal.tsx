"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon, LoaderCircle, Search } from "lucide-react";
import { type ReactNode, useDeferredValue, useEffect, useState } from "react";

import Modal from "@/components/ui/admin/shared/modal";
import { IconButton } from "@/components/ui/buttons/icon-button";
import { Input } from "@/components/ui/inputs/input";
import { useGetImagesQuery } from "@/lib/store/animi/image-endpoints";
import type { PrivateImage } from "@/lib/types/entites/image-type";
import cn from "@/lib/utils/cn";

const IMAGE_PAGE_SIZE = 24;

export default function ImageLibraryModal({
    open,
    title,
    description,
    selectedId,
    aspect = "poster",
    avatarOnly = false,
    onClose,
    onSelect,
}: {
    open: boolean;
    title: string;
    description: string;
    selectedId: number | null;
    aspect?: "poster" | "square";
    avatarOnly?: boolean;
    onClose: () => void;
    onSelect: (image: PrivateImage) => void;
}) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const deferredSearch = useDeferredValue(search.trim());
    const { data, isLoading, isFetching, error } = useGetImagesQuery(
        {
            search: deferredSearch || undefined,
            page,
            limit: IMAGE_PAGE_SIZE,
            avatarAllowed: avatarOnly ? true : undefined,
        },
        { skip: !open },
    );

    useEffect(() => setPage(1), [deferredSearch]);
    useEffect(() => {
        if (open) {
            setSearch("");
            setPage(1);
        }
    }, [open]);

    const totalPages = Math.max(data?.totalPages ?? 1, 1);

    return (
        <Modal
            open={open}
            title={title}
            onClose={onClose}
            className="sm:w-[min(920px,calc(100vw-32px))]"
        >
            <div className="flex max-h-[78dvh] min-h-0 flex-col gap-4 sm:max-h-[72dvh]">
                <div className="shrink-0">
                    <Input
                        icon={<Search size={18} strokeWidth={1.8} />}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={
                            avatarOnly
                                ? "ID, користувач, аніме або жанр"
                                : "ID, аніме, жанр або користувач"
                        }
                        autoFocus
                    />
                    <p className="mt-2 text-[13px] leading-5 text-white/32">
                        {description}
                    </p>
                </div>

                <div className="min-h-[220px] flex-1 overflow-y-auto pr-1 sm:min-h-[250px]">
                    {(isLoading || (isFetching && !data)) && (
                        <LibraryState>
                            <LoaderCircle size={18} className="animate-spin" />
                            Завантаження зображень...
                        </LibraryState>
                    )}
                    {error && !isLoading && (
                        <LibraryState className="text-red-300/75">
                            Не вдалося завантажити зображення.
                        </LibraryState>
                    )}
                    {!isLoading && !error && data?.items.length === 0 && (
                        <LibraryState className="flex-col gap-2 text-white/30">
                            <ImageIcon size={26} strokeWidth={1.5} />
                            Зображень не знайдено
                        </LibraryState>
                    )}

                    <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
                        {data?.items.map((image) => (
                            <button
                                key={image.id}
                                type="button"
                                onClick={() => onSelect(image)}
                                className={cn(
                                    "group relative overflow-hidden rounded-lg border bg-white/[0.03] transition",
                                    aspect === "square" ? "aspect-square" : "aspect-[3/4]",
                                    selectedId === image.id
                                        ? "border-(--green) ring-1 ring-(--green)"
                                        : "border-white/[0.06] hover:border-white/20",
                                )}
                                title={`Зображення #${image.id}`}
                            >
                                <Image
                                    src={`/uploads/${encodeURIComponent(image.path)}`}
                                    alt={`Зображення #${image.id}`}
                                    fill
                                    unoptimized
                                    sizes="150px"
                                    className="object-cover transition duration-200 group-hover:scale-[1.025]"
                                />
                                <span className="absolute bottom-1.5 left-1.5 rounded bg-black/65 px-1.5 py-0.5 text-[11px] text-white/65 backdrop-blur-sm">
                                    #{image.id}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
                    <span className="min-w-0 truncate text-[13px] text-white/35">
                        {data?.totalCount ?? 0} зображень · {page}/{totalPages}
                    </span>
                    <div className="flex shrink-0 gap-1.5">
                        <LibraryPageButton
                            label="Попередня сторінка"
                            disabled={page <= 1 || isFetching}
                            onClick={() => setPage((value) => Math.max(1, value - 1))}
                        >
                            <ChevronLeft size={18} />
                        </LibraryPageButton>
                        <LibraryPageButton
                            label="Наступна сторінка"
                            disabled={page >= totalPages || isFetching}
                            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                        >
                            <ChevronRight size={18} />
                        </LibraryPageButton>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

function LibraryState({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex h-[220px] items-center justify-center gap-2 text-center text-[14px] text-white/40 sm:h-[250px]",
                className,
            )}
        >
            {children}
        </div>
    );
}

function LibraryPageButton({
    label,
    disabled,
    onClick,
    children,
}: {
    label: string;
    disabled: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <IconButton
            type="button"
            variant="secondary"
            onClick={onClick}
            disabled={disabled}
            className="rounded-md"
            aria-label={label}
        >
            {children}
        </IconButton>
    );
}
