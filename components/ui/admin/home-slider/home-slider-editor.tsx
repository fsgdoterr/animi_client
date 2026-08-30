"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, ImageIcon, LoaderCircle, Plus, Save, Search, Trash2, X } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import ImageLibraryModal from "@/components/ui/admin/shared/image-library-modal";
import ErrorAlert from "@/components/ui/admin/shared/error-alert";
import { Button } from "@/components/ui/buttons/button";
import { Input } from "@/components/ui/inputs/input";
import {
    useGetAnimesQuery,
    useGetHomeSliderQuery,
    useUpdateHomeSliderMutation,
} from "@/lib/store/animi/anime-endpoints";
import { AnimeStatus, type AnimeListItem } from "@/lib/types/entites/anime";
import type { PrivateImage } from "@/lib/types/entites/image-type";
import type { AdminHomeSliderAnime } from "@/lib/types/public";
import { imageSrc } from "@/lib/utils/public-anime";

const MAX_SLIDES = 10;

type EditableSlide = {
    key: string;
    anime: AdminHomeSliderAnime;
    image: PrivateImage | null;
};

export default function HomeSliderEditor() {
    const { data, isLoading, error } = useGetHomeSliderQuery();
    const [updateSlider, updateState] = useUpdateHomeSliderMutation();
    const [items, setItems] = useState<EditableSlide[]>([]);
    const [dirty, setDirty] = useState(false);
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search.trim());
    const [imageIndex, setImageIndex] = useState<number | null>(null);
    const { data: animeSearch, isFetching: animeSearchLoading } = useGetAnimesQuery(
        {
            search: deferredSearch || undefined,
            page: 1,
            limit: 8,
            sort: "new",
        },
        { skip: deferredSearch.length < 2 },
    );

    useEffect(() => {
        if (!data || dirty) return;
        setItems(
            data.map((item) => ({
                key: `saved-${item.id}`,
                anime: item.anime,
                image: item.image,
            })),
        );
    }, [data, dirty]);

    const selectedIds = useMemo(() => new Set(items.map((item) => item.anime.id)), [items]);
    const canAdd = items.length < MAX_SLIDES;

    function addAnime(anime: AnimeListItem) {
        if (!canAdd || selectedIds.has(anime.id) || anime.status === AnimeStatus.DRAFT) return;
        setItems((current) => [
            ...current,
            {
                key: `new-${anime.id}-${Date.now()}`,
                anime,
                image: null,
            },
        ]);
        setSearch("");
        setDirty(true);
    }

    function updateOrder(index: number, direction: -1 | 1) {
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= items.length) return;
        setItems((current) => {
            const next = [...current];
            [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
            return next;
        });
        setDirty(true);
    }

    async function save() {
        try {
            const saved = await updateSlider({
                items: items.map((item) => ({
                    animeId: item.anime.id,
                    imageId: item.image?.id ?? null,
                })),
            }).unwrap();
            setItems(
                saved.map((item) => ({
                    key: `saved-${item.id}`,
                    anime: item.anime,
                    image: item.image,
                })),
            );
            setDirty(false);
        } catch {
            // Error alert below handles mutation error.
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-full min-h-[420px] items-center justify-center rounded-xl bg-[#11171c] text-white/35">
                <LoaderCircle size={20} className="mr-2 animate-spin" />
                Завантаження слайдера...
            </div>
        );
    }

    return (
        <div className="flex min-h-full flex-col rounded-xl border border-white/[0.025] bg-[#0c1115] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.12)] sm:p-5 lg:p-6">
            <header className="flex flex-col gap-3 border-b border-white/[0.05] pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-[24px] font-medium tracking-tight text-white/92 sm:text-[28px]">Слайдер головної</h1>
                    <p className="mt-1 max-w-2xl text-[13px] leading-5 text-white/35 sm:text-sm">
                        Оберіть до {MAX_SLIDES} аніме, змініть порядок і, за потреби, задайте окремий широкий банер. Без банера використовується постер.
                    </p>
                </div>
                <Button
                    type="button"
                    color="green"
                    onClick={save}
                    disabled={!dirty || updateState.isLoading}
                    className="w-full shrink-0 sm:w-auto"
                >
                    {updateState.isLoading ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}
                    Зберегти
                </Button>
            </header>

            <ErrorAlert error={error ?? updateState.error} />

            <section className="mt-4 rounded-xl border border-white/[0.04] bg-[#11171c] p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-[16px] text-white/82">Додати аніме</h2>
                        <p className="mt-0.5 text-xs text-white/30">Чернетки не можна додавати до публічного слайдера.</p>
                    </div>
                    <span className="text-xs text-white/30">{items.length}/{MAX_SLIDES}</span>
                </div>

                <div className="relative mt-3">
                    <Input
                        icon={<Search size={18} strokeWidth={1.8} />}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        disabled={!canAdd}
                        placeholder={canAdd ? "Почніть вводити назву аніме" : "Досягнуто ліміт слайдів"}
                    />

                    {deferredSearch.length >= 2 && canAdd && (
                        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-30 max-h-72 overflow-y-auto rounded-xl border border-white/[0.07] bg-[#0d1317] p-1.5 shadow-2xl shadow-black/40">
                            {animeSearchLoading && !animeSearch?.items.length ? (
                                <div className="px-3 py-5 text-center text-sm text-white/32">Пошук...</div>
                            ) : animeSearch?.items.length ? (
                                animeSearch.items.map((anime) => {
                                    const selected = selectedIds.has(anime.id);
                                    const draft = anime.status === AnimeStatus.DRAFT;
                                    return (
                                        <button
                                            type="button"
                                            key={anime.id}
                                            onClick={() => addAnime(anime)}
                                            disabled={selected || draft}
                                            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-35"
                                        >
                                            <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-white/[0.04]">
                                                {anime.poster?.path && (
                                                    <Image src={imageSrc(anime.poster.path)!} alt="" fill unoptimized sizes="44px" className="object-cover" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm text-white/80">{anime.title}</p>
                                                <p className="mt-0.5 text-xs text-white/28">
                                                    #{anime.id} · {draft ? "Чернетка" : anime.status}
                                                </p>
                                            </div>
                                            {!selected && !draft && <Plus size={17} className="text-white/35" />}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-3 py-5 text-center text-sm text-white/32">Нічого не знайдено</div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="mt-4 min-h-0 flex-1">
                {items.length === 0 ? (
                    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.07] bg-white/[0.015] px-6 text-center">
                        <ImageIcon size={28} className="text-white/22" />
                        <p className="mt-3 text-sm text-white/45">Слайдер порожній</p>
                        <p className="mt-1 max-w-sm text-xs leading-5 text-white/25">Додайте хоча б одне аніме. Поки налаштування порожнє, публічна сторінка використовує новинки як резервні слайди.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <SlideRow
                                key={item.key}
                                item={item}
                                index={index}
                                count={items.length}
                                onMove={updateOrder}
                                onPickImage={() => setImageIndex(index)}
                                onClearImage={() => {
                                    setItems((current) => current.map((slide, i) => i === index ? { ...slide, image: null } : slide));
                                    setDirty(true);
                                }}
                                onRemove={() => {
                                    setItems((current) => current.filter((_, i) => i !== index));
                                    setDirty(true);
                                }}
                            />
                        ))}
                    </div>
                )}
            </section>

            <ImageLibraryModal
                open={imageIndex !== null}
                title="Банер для слайду"
                description="Рекомендоване співвідношення сторін — приблизно 16:7 або ширше."
                selectedId={imageIndex !== null ? items[imageIndex]?.image?.id ?? null : null}
                aspect="poster"
                onClose={() => setImageIndex(null)}
                onSelect={(image) => {
                    if (imageIndex === null) return;
                    setItems((current) => current.map((slide, i) => i === imageIndex ? { ...slide, image } : slide));
                    setDirty(true);
                    setImageIndex(null);
                }}
            />
        </div>
    );
}

function SlideRow({
    item,
    index,
    count,
    onMove,
    onPickImage,
    onClearImage,
    onRemove,
}: {
    item: EditableSlide;
    index: number;
    count: number;
    onMove: (index: number, direction: -1 | 1) => void;
    onPickImage: () => void;
    onClearImage: () => void;
    onRemove: () => void;
}) {
    const banner = imageSrc(item.image?.path ?? item.anime.poster?.path);
    return (
        <article className="grid gap-3 rounded-xl border border-white/[0.045] bg-[#11171c] p-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="grid min-w-0 gap-3 sm:grid-cols-[220px_minmax(0,1fr)]">
                <button
                    type="button"
                    onClick={onPickImage}
                    className="group relative aspect-[16/7] cursor-pointer overflow-hidden rounded-lg border border-white/[0.06] bg-[#0a0f12] text-left"
                >
                    {banner ? (
                        <Image src={banner} alt="" fill unoptimized sizes="220px" className="object-cover transition duration-300 group-hover:scale-[1.02]" />
                    ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(228,95,58,.22),transparent_45%)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-1 text-[11px] text-white/70 backdrop-blur-sm">
                        {item.image ? "Змінити банер" : "Вибрати банер"}
                    </span>
                </button>

                <div className="min-w-0 self-center">
                    <div className="flex items-center gap-2">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/[0.05] text-xs text-white/40">{index + 1}</span>
                        <h3 className="truncate text-[16px] text-white/85">{item.anime.title}</h3>
                    </div>
                    <p className="mt-1.5 pl-9 text-xs text-white/28">#{item.anime.id} · {item.anime.type} · {item.anime.status}</p>
                    {item.image && (
                        <button type="button" onClick={onClearImage} className="mt-2 ml-9 inline-flex cursor-pointer items-center gap-1 text-xs text-white/35 transition hover:text-white/65">
                            <X size={13} /> Використовувати постер
                        </button>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-1.5 border-t border-white/[0.045] pt-3 lg:border-0 lg:pt-0">
                <MiniButton label="Вище" disabled={index === 0} onClick={() => onMove(index, -1)}><ArrowUp size={16} /></MiniButton>
                <MiniButton label="Нижче" disabled={index === count - 1} onClick={() => onMove(index, 1)}><ArrowDown size={16} /></MiniButton>
                <MiniButton label="Видалити" danger onClick={onRemove}><Trash2 size={16} /></MiniButton>
            </div>
        </article>
    );
}

function MiniButton({
    label,
    disabled,
    danger,
    onClick,
    children,
}: {
    label: string;
    disabled?: boolean;
    danger?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className={`grid size-9 cursor-pointer place-items-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-25 ${danger ? "border-red-400/10 bg-red-400/[0.04] text-red-300/60 hover:bg-red-400/10 hover:text-red-300" : "border-white/[0.055] bg-white/[0.03] text-white/40 hover:bg-white/[0.07] hover:text-white/75"}`}
        >
            {children}
        </button>
    );
}
