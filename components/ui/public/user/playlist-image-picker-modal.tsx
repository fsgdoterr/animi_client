"use client";

import Image from "next/image";
import { Check, ChevronLeft, ChevronRight, ImageIcon, LoaderCircle, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import PublicModal from "@/components/ui/public/shared/public-modal";
import { useGetPublicPlaylistImagesQuery } from "@/lib/store/animi/public-endpoints";
import type { Image as ImageType } from "@/lib/types/entites/image-type";
import cn from "@/lib/utils/cn";
import { imageSrc } from "@/lib/utils/public-anime";

export default function PlaylistImagePickerModal({
    username,
    open,
    selectedId,
    onClose,
    onSelect,
}: {
    username: string;
    open: boolean;
    selectedId: number | null;
    onClose: () => void;
    onSelect: (image: ImageType) => void;
}) {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!open) return;
        const timeout = window.setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 250);
        return () => window.clearTimeout(timeout);
    }, [open, search]);

    useEffect(() => {
        if (!open) {
            setSearch("");
            setDebouncedSearch("");
            setPage(1);
        }
    }, [open]);

    const { data, isFetching, isError, refetch } = useGetPublicPlaylistImagesQuery(
        {
            username,
            page,
            limit: 18,
            search: debouncedSearch || undefined,
        },
        { skip: !open },
    );

    return (
        <PublicModal
            open={open}
            onClose={onClose}
            className="z-[150]"
            panelClassName="flex max-h-[calc(100dvh-24px)] max-w-[760px] flex-col overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#11171c] shadow-[0_28px_90px_rgba(0,0,0,.58)]"
        >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.05] p-4 sm:p-5">
                <div>
                    <h2 className="text-[19px] font-medium text-white/92">Обрати зображення</h2>
                    <p className="mt-1 text-[13px] leading-5 text-white/36">
                        Доступні лише зображення, дозволені адміністратором для аватарів.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl bg-white/[0.045] text-white/45 transition hover:bg-white/[0.08] hover:text-white/75"
                    aria-label="Закрити"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                <div className="flex h-11 items-center gap-2 rounded-xl border border-white/[0.055] bg-[#171d22] px-3.5 focus-within:border-white/15">
                    <Search size={17} className="text-white/32" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Пошук зображення"
                        className="min-w-0 flex-1 bg-transparent text-[14px] text-white/84 outline-none placeholder:text-white/24"
                    />
                    {isFetching && <LoaderCircle size={15} className="animate-spin text-white/28" />}
                </div>

                {isError ? (
                    <div className="mt-4 rounded-xl border border-red-400/15 bg-red-500/[0.07] px-4 py-8 text-center">
                        <p className="text-[13px] text-red-200/80">Не вдалося завантажити зображення.</p>
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="mt-3 text-[12px] text-(--primary-3) hover:underline"
                        >
                            Спробувати ще раз
                        </button>
                    </div>
                ) : data?.items.length ? (
                    <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
                        {data.items.map((image) => {
                            const selected = selectedId === image.id;
                            return (
                                <button
                                    key={image.id}
                                    type="button"
                                    onClick={() => onSelect(image)}
                                    className={cn(
                                        "group relative aspect-square overflow-hidden rounded-xl border bg-white/[0.035] transition",
                                        selected
                                            ? "[border-color:color-mix(in_srgb,var(--primary)_60%,transparent)] ring-1 ring-(--primary)/35"
                                            : "border-white/[0.055] hover:border-white/15",
                                    )}
                                    aria-label="Обрати зображення"
                                >
                                    {imageSrc(image.path) ? (
                                        <Image
                                            src={imageSrc(image.path)!}
                                            alt=""
                                            fill
                                            unoptimized
                                            sizes="120px"
                                            className="object-cover transition duration-300 group-hover:scale-[1.03]"
                                        />
                                    ) : (
                                        <span className="absolute inset-0 grid place-items-center text-white/18">
                                            <ImageIcon size={22} />
                                        </span>
                                    )}
                                    <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
                                    {selected && (
                                        <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-(--primary) text-white shadow-lg">
                                            <Check size={14} />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ) : isFetching ? (
                    <div className="grid min-h-[260px] place-items-center text-white/24">
                        <LoaderCircle className="animate-spin" />
                    </div>
                ) : (
                    <div className="mt-4 grid min-h-[220px] place-items-center rounded-xl border border-dashed border-white/[0.055] text-center">
                        <div>
                            <ImageIcon size={25} className="mx-auto text-white/17" />
                            <p className="mt-2 text-[13px] text-white/36">Доступних зображень не знайдено</p>
                        </div>
                    </div>
                )}
            </div>

            {(data?.totalPages ?? 1) > 1 && (
                <div className="flex items-center justify-center gap-3 border-t border-white/[0.05] p-3.5">
                    <button
                        type="button"
                        disabled={page <= 1 || isFetching}
                        onClick={() => setPage((value) => Math.max(1, value - 1))}
                        className="grid size-9 place-items-center rounded-xl bg-white/[0.04] text-white/42 transition hover:bg-white/[0.08] disabled:opacity-25"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-[11px] text-white/30">{page} / {data?.totalPages}</span>
                    <button
                        type="button"
                        disabled={page >= (data?.totalPages ?? 1) || isFetching}
                        onClick={() => setPage((value) => value + 1)}
                        className="grid size-9 place-items-center rounded-xl bg-white/[0.04] text-white/42 transition hover:bg-white/[0.08] disabled:opacity-25"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </PublicModal>
    );
}
