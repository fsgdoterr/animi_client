"use client";

import Image from "next/image";
import { ImageIcon, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

import ImageLibraryModal from "@/components/ui/admin/shared/image-library-modal";
import ImageSourceModal from "@/components/ui/admin/shared/image-source-modal";
import { IconButton } from "@/components/ui/buttons/icon-button";
import type {
    Image as ImageType,
    PrivateImage,
} from "@/lib/types/entites/image-type";

type ImageValue = string | number | null;

type Props = {
    value: ImageValue[];
    initialImages: (ImageType | PrivateImage)[];
    onChange: (value: ImageValue[]) => void;
};

export default function AdditionalImagesPicker({
    value,
    initialImages,
    onChange,
}: Props) {
    const [sourceOpen, setSourceOpen] = useState(false);
    const [libraryOpen, setLibraryOpen] = useState(false);
    const [knownImages, setKnownImages] = useState<
        (ImageType | PrivateImage)[]
    >(initialImages);

    const cards = useMemo(
        () =>
            value
                .filter((item): item is string | number => item !== null)
                .map((item) => {
                    if (typeof item === "string") {
                        return { key: `url:${item}`, value: item, src: item };
                    }

                    const image = knownImages.find((candidate) => candidate.id === item);
                    return {
                        key: `id:${item}`,
                        value: item,
                        src: image
                            ? `/uploads/${encodeURIComponent(image.path)}`
                            : null,
                    };
                }),
        [knownImages, value],
    );

    function addImage(image: PrivateImage) {
        setKnownImages((current) =>
            current.some((candidate) => candidate.id === image.id)
                ? current
                : [...current, image],
        );
        if (!value.includes(image.id)) onChange([...value, image.id]);
        setLibraryOpen(false);
    }

    function addUrl(url: string) {
        if (!value.includes(url)) onChange([...value, url]);
        setSourceOpen(false);
    }

    function removeItem(item: string | number) {
        onChange(value.filter((candidate) => candidate !== item));
    }

    return (
        <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2">
                {cards.map((card) => (
                    <div
                        key={card.key}
                        className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-white/[0.06] bg-[#181e23]"
                    >
                        {card.src ? (
                            typeof card.value === "string" ? (
                                // User-provided external URL.
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={card.src}
                                    alt="Додаткове зображення"
                                    className="absolute inset-0 size-full object-cover"
                                />
                            ) : (
                                <Image
                                    src={card.src}
                                    alt="Додаткове зображення"
                                    fill
                                    unoptimized
                                    sizes="180px"
                                    className="object-cover"
                                />
                            )
                        ) : (
                            <div className="flex size-full items-center justify-center text-white/20">
                                <ImageIcon size={24} strokeWidth={1.5} />
                            </div>
                        )}
                        <IconButton
                            type="button"
                            variant="secondary"
                            onClick={() => removeItem(card.value)}
                            className="absolute right-1.5 top-1.5 size-7 rounded-full border-white/15 bg-black/65 text-white/70 opacity-100 backdrop-blur-sm hover:bg-black/80 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                            aria-label="Видалити додаткове зображення"
                        >
                            <X size={15} />
                        </IconButton>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() => setSourceOpen(true)}
                    className="flex aspect-[4/3] min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/[0.12] bg-white/[0.018] text-white/36 transition hover:border-white/25 hover:bg-white/[0.035] hover:text-white/70"
                >
                    <Plus size={20} />
                    <span className="text-[13px]">Додати</span>
                </button>
            </div>

            <ImageSourceModal
                open={sourceOpen}
                title="Додати зображення"
                urlDescription="Додайте зовнішнє зображення за URL."
                libraryDescription="Використайте вже завантажене зображення."
                onClose={() => setSourceOpen(false)}
                onUrl={addUrl}
                onOpenLibrary={() => {
                    setSourceOpen(false);
                    setLibraryOpen(true);
                }}
            />

            <ImageLibraryModal
                open={libraryOpen}
                title="Обрати додаткове зображення"
                description="Можна додавати кілька зображень по одному."
                selectedId={null}
                aspect="square"
                onClose={() => setLibraryOpen(false)}
                onSelect={addImage}
            />
        </>
    );
}
