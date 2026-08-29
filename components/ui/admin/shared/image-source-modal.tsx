"use client";

import { ImageIcon, Link2 } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import Modal from "@/components/ui/admin/shared/modal";
import { Button } from "@/components/ui/buttons/button";
import { Input } from "@/components/ui/inputs/input";

type SourceMode = "choice" | "url";
type UrlFormValues = { url: string };

type Props = {
    open: boolean;
    title: string;
    urlDescription: string;
    libraryDescription: string;
    onClose: () => void;
    onUrl: (url: string) => void;
    onOpenLibrary: () => void;
};

export default function ImageSourceModal({
    open,
    title,
    urlDescription,
    libraryDescription,
    onClose,
    onUrl,
    onOpenLibrary,
}: Props) {
    const [mode, setMode] = useState<SourceMode>("choice");
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UrlFormValues>({ defaultValues: { url: "" } });

    useEffect(() => {
        if (!open) return;
        setMode("choice");
        reset({ url: "" });
    }, [open, reset]);

    const submitUrl = handleSubmit(({ url }) => onUrl(url.trim()));

    return (
        <Modal open={open} title={title} onClose={onClose}>
            {mode === "choice" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                    <SourceButton
                        icon={<Link2 size={24} strokeWidth={1.6} />}
                        title="Ввести посилання"
                        description={urlDescription}
                        onClick={() => setMode("url")}
                    />
                    <SourceButton
                        icon={<ImageIcon size={24} strokeWidth={1.6} />}
                        title="Обрати з наявних"
                        description={libraryDescription}
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
                            placeholder="https://example.com/image.jpg"
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
                            onClick={() => setMode("choice")}
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

function SourceButton({
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
