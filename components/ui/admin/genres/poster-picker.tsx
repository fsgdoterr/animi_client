"use client";

import Image from "next/image";
import { ImageIcon, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ImageLibraryModal from "@/components/ui/admin/shared/image-library-modal";
import ImageSourceModal from "@/components/ui/admin/shared/image-source-modal";
import { Button } from "@/components/ui/buttons/button";
import { IconButton } from "@/components/ui/buttons/icon-button";
import type {
    Image as ImageType,
    PrivateImage,
} from "@/lib/types/entites/image-type";

type PosterValue = string | number | null;

type Props = {
    value: PosterValue;
    initialPoster: ImageType | PrivateImage | null;
    onChange: (
        value: PosterValue,
        image?: PrivateImage | ImageType | null,
    ) => void;
};

export default function PosterPicker({ value, initialPoster, onChange }: Props) {
    const [sourceOpen, setSourceOpen] = useState(false);
    const [libraryOpen, setLibraryOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<
        PrivateImage | ImageType | null
    >(initialPoster);

    useEffect(() => {
        if (
            typeof value === "number" &&
            initialPoster?.id === value &&
            selectedImage?.id !== value
        ) {
            setSelectedImage(initialPoster);
        }
    }, [initialPoster, selectedImage?.id, value]);

    const previewSrc = useMemo(() => {
        if (typeof value === "string" && value.trim()) return value.trim();
        if (typeof value !== "number") return null;

        const image =
            selectedImage?.id === value
                ? selectedImage
                : initialPoster?.id === value
                  ? initialPoster
                  : null;

        return image ? `/uploads/${encodeURIComponent(image.path)}` : null;
    }, [initialPoster, selectedImage, value]);

    function handleSelectImage(image: PrivateImage) {
        setSelectedImage(image);
        onChange(image.id, image);
        setLibraryOpen(false);
    }

    function handleUrl(url: string) {
        setSelectedImage(null);
        onChange(url);
        setSourceOpen(false);
    }

    function clearPoster() {
        setSelectedImage(null);
        onChange(null, null);
    }

    return (
        <>
            <div className="relative aspect-[3/4] w-full max-w-[210px] overflow-hidden rounded-xl border border-white/[0.065] bg-[#181e23] shadow-[0_12px_40px_rgba(0,0,0,0.16)]">
                {previewSrc ? (
                    <>
                        <button
                            type="button"
                            onClick={() => setSourceOpen(true)}
                            className="group absolute inset-0 z-10 cursor-pointer"
                            aria-label="Змінити постер"
                        >
                            <span className="absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2.5 text-center text-[14px] text-white/85 opacity-100 backdrop-blur-sm sm:translate-y-full sm:transition-transform sm:group-hover:translate-y-0">
                                Змінити постер
                            </span>
                        </button>
                        {typeof value === "string" ? (
                            // User-provided external URL.
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={previewSrc}
                                alt="Постер жанру"
                                className="absolute inset-0 size-full object-cover"
                            />
                        ) : (
                            <Image
                                src={previewSrc}
                                alt="Постер жанру"
                                fill
                                unoptimized
                                sizes="210px"
                                className="object-cover"
                            />
                        )}
                        <IconButton
                            type="button"
                            variant="secondary"
                            onClick={clearPoster}
                            className="absolute right-2 top-2 z-20 size-8 rounded-full border-white/15 bg-black/65 text-white/75 backdrop-blur-sm hover:bg-black/80 hover:text-white"
                            aria-label="Скинути постер"
                        >
                            <X size={17} strokeWidth={2} />
                        </IconButton>
                    </>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-white/[0.045] text-white/25">
                            <ImageIcon size={24} strokeWidth={1.5} />
                        </div>
                        <Button
                            type="button"
                            color="green"
                            onClick={() => setSourceOpen(true)}
                        >
                            Додати постер
                        </Button>
                    </div>
                )}
            </div>

            <ImageSourceModal
                open={sourceOpen}
                title="Додати постер"
                urlDescription="Вкажіть прямий URL зображення."
                libraryDescription="Знайдіть зображення за назвою аніме."
                onClose={() => setSourceOpen(false)}
                onUrl={handleUrl}
                onOpenLibrary={() => {
                    setSourceOpen(false);
                    setLibraryOpen(true);
                }}
            />

            <ImageLibraryModal
                open={libraryOpen}
                title="Обрати зображення"
                description="Пошук знаходить постери та додаткові зображення, привʼязані до аніме."
                selectedId={typeof value === "number" ? value : null}
                aspect="poster"
                onClose={() => setLibraryOpen(false)}
                onSelect={handleSelectImage}
            />
        </>
    );
}
