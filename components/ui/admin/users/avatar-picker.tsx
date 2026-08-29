"use client";

import Image from "next/image";
import { ImageIcon, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ImageLibraryModal from "@/components/ui/admin/shared/image-library-modal";
import { Button } from "@/components/ui/buttons/button";
import { IconButton } from "@/components/ui/buttons/icon-button";
import type {
    Image as ImageType,
    PrivateImage,
} from "@/lib/types/entites/image-type";

type Props = {
    value: number | null;
    initialAvatar: ImageType | PrivateImage | null;
    onChange: (value: number | null) => void;
};

export default function AvatarPicker({
    value,
    initialAvatar,
    onChange,
}: Props) {
    const [libraryOpen, setLibraryOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<
        PrivateImage | ImageType | null
    >(initialAvatar);

    useEffect(() => {
        if (value === initialAvatar?.id && selectedImage?.id !== value) {
            setSelectedImage(initialAvatar);
        }
    }, [initialAvatar, selectedImage?.id, value]);

    const previewSrc = useMemo(() => {
        if (value === null) return null;

        const image =
            selectedImage?.id === value
                ? selectedImage
                : initialAvatar?.id === value
                  ? initialAvatar
                  : null;

        return image ? `/uploads/${encodeURIComponent(image.path)}` : null;
    }, [initialAvatar, selectedImage, value]);

    function handleSelect(image: PrivateImage) {
        setSelectedImage(image);
        onChange(image.id);
        setLibraryOpen(false);
    }

    function clearAvatar() {
        setSelectedImage(null);
        onChange(null);
    }

    return (
        <>
            <div className="relative aspect-square w-full max-w-[190px] overflow-hidden rounded-xl border border-white/[0.065] bg-[#181e23] shadow-[0_12px_40px_rgba(0,0,0,0.16)]">
                {previewSrc ? (
                    <>
                        <button
                            type="button"
                            onClick={() => setLibraryOpen(true)}
                            className="group absolute inset-0 z-10 cursor-pointer"
                            aria-label="Змінити аватар"
                        >
                            <span className="absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2.5 text-center text-[14px] text-white/85 opacity-100 backdrop-blur-sm sm:translate-y-full sm:transition-transform sm:group-hover:translate-y-0">
                                Змінити аватар
                            </span>
                        </button>
                        <Image
                            src={previewSrc}
                            alt="Аватар користувача"
                            fill
                            unoptimized
                            sizes="190px"
                            className="object-cover"
                        />
                        <IconButton
                            type="button"
                            variant="secondary"
                            onClick={clearAvatar}
                            className="absolute right-2 top-2 z-20 size-8 rounded-full border-white/15 bg-black/65 text-white/75 backdrop-blur-sm hover:bg-black/80 hover:text-white"
                            aria-label="Прибрати аватар"
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
                            onClick={() => setLibraryOpen(true)}
                            className="max-w-full"
                        >
                            Обрати аватар
                        </Button>
                    </div>
                )}
            </div>

            <ImageLibraryModal
                open={libraryOpen}
                title="Обрати аватар"
                description="Доступні лише зображення, дозволені адміністратором для використання як аватар."
                selectedId={value}
                aspect="square"
                avatarOnly
                onClose={() => setLibraryOpen(false)}
                onSelect={handleSelect}
            />
        </>
    );
}
