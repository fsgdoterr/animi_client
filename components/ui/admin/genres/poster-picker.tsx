"use client";

import Image from "next/image";
import { ImageIcon, Link2, X } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import ImageLibraryModal from "@/components/ui/admin/shared/image-library-modal";
import Modal from "@/components/ui/admin/shared/modal";
import { Button } from "@/components/ui/buttons/button";
import { IconButton } from "@/components/ui/buttons/icon-button";
import { Input } from "@/components/ui/inputs/input";
import type {
    Image as ImageType,
    PrivateImage,
} from "@/lib/types/entites/image-type";

type PosterValue = string | number | null;
type AddPosterMode = "choice" | "url";
type UrlFormValues = { url: string };

type Props = {
    value: PosterValue;
    initialPoster: ImageType | PrivateImage | null;
    onChange: (
        value: PosterValue,
        image?: PrivateImage | ImageType | null,
    ) => void;
};

export default function PosterPicker({ value, initialPoster, onChange }: Props) {
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addMode, setAddMode] = useState<AddPosterMode>("choice");
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

    function openAddModal() {
        setAddMode("choice");
        setAddModalOpen(true);
    }

    function handleSelectImage(image: PrivateImage) {
        setSelectedImage(image);
        onChange(image.id, image);
        setLibraryOpen(false);
    }

    function handleUrl(url: string) {
        setSelectedImage(null);
        onChange(url);
        setAddModalOpen(false);
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
                            onClick={openAddModal}
                            className="group absolute inset-0 z-10 cursor-pointer"
                            aria-label="Змінити постер"
                        >
                            <span className="absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2.5 text-center text-[14px] text-white/85 opacity-100 backdrop-blur-sm sm:translate-y-full sm:transition-transform sm:group-hover:translate-y-0">
                                Змінити постер
                            </span>
                        </button>
                        {typeof value === "string" ? (
                            // Remote URLs are user-provided and cannot be known in next.config.
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
                        <Button type="button" color="green" onClick={openAddModal}>
                            Додати постер
                        </Button>
                    </div>
                )}
            </div>

            <AddPosterModal
                open={addModalOpen}
                mode={addMode}
                onModeChange={setAddMode}
                onClose={() => setAddModalOpen(false)}
                onUrl={handleUrl}
                onOpenLibrary={() => {
                    setAddModalOpen(false);
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

function AddPosterModal({
    open,
    mode,
    onModeChange,
    onClose,
    onUrl,
    onOpenLibrary,
}: {
    open: boolean;
    mode: AddPosterMode;
    onModeChange: (mode: AddPosterMode) => void;
    onClose: () => void;
    onUrl: (url: string) => void;
    onOpenLibrary: () => void;
}) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UrlFormValues>({ defaultValues: { url: "" } });

    useEffect(() => {
        if (open) reset({ url: "" });
    }, [open, reset]);

    const submitUrl = handleSubmit((values) => onUrl(values.url.trim()));

    return (
        <Modal open={open} title="Додати постер" onClose={onClose}>
            {mode === "choice" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                    <PosterSourceButton
                        icon={<Link2 size={24} strokeWidth={1.6} />}
                        title="Ввести посилання"
                        description="Вкажіть прямий URL зображення."
                        onClick={() => onModeChange("url")}
                    />
                    <PosterSourceButton
                        icon={<ImageIcon size={24} strokeWidth={1.6} />}
                        title="Обрати з наявних"
                        description="Знайдіть зображення за назвою аніме."
                        onClick={onOpenLibrary}
                    />
                </div>
            ) : (
                <div className="grid gap-4">
                    <label className="grid gap-2">
                        <span className="text-[14px] text-white/70">
                            URL зображення
                        </span>
                        <Input
                            {...register("url", {
                                required: "Вкажіть посилання на зображення.",
                                validate: validateImageUrl,
                            })}
                            autoFocus
                            inputMode="url"
                            placeholder="https://example.com/poster.jpg"
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    void submitUrl();
                                }
                            }}
                        />
                        {errors.url && (
                            <span className="text-[13px] text-red-300/85">
                                {errors.url.message}
                            </span>
                        )}
                    </label>
                    <div className="grid gap-2 min-[420px]:grid-cols-2 sm:flex sm:justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => onModeChange("choice")}
                        >
                            Назад
                        </Button>
                        <Button
                            type="button"
                            color="green"
                            onClick={() => void submitUrl()}
                            className="w-full sm:w-auto"
                        >
                            Використати
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}

function PosterSourceButton({
    icon,
    title,
    description,
    onClick,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition hover:border-white/[0.13] hover:bg-white/[0.045] sm:p-5"
        >
            <span className="mb-3 block text-(--green) sm:mb-4">{icon}</span>
            <span className="block text-[16px] text-white/88">{title}</span>
            <span className="mt-1 block text-[13px] leading-5 text-white/36">
                {description}
            </span>
        </button>
    );
}

function validateImageUrl(value: string) {
    try {
        const url = new URL(value.trim());
        return (
            ["http:", "https:"].includes(url.protocol) ||
            "Посилання має починатися з http:// або https://"
        );
    } catch {
        return "Вкажіть коректне посилання.";
    }
}
