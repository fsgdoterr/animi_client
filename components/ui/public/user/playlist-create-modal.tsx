"use client";

import Image from "next/image";
import { ImagePlus, LoaderCircle, Lock, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import PublicModal from "@/components/ui/public/shared/public-modal";
import PlaylistImagePickerModal from "@/components/ui/public/user/playlist-image-picker-modal";
import { useCreatePublicPlaylistMutation } from "@/lib/store/animi/public-endpoints";
import type { Image as ImageType } from "@/lib/types/entites/image-type";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import cn from "@/lib/utils/cn";
import { imageSrc } from "@/lib/utils/public-anime";

export default function PlaylistCreateModal({
    username,
    open,
    onClose,
}: {
    username: string;
    open: boolean;
    onClose: () => void;
}) {
    const [imagePickerOpen, setImagePickerOpen] = useState(false);
    const [busy, setBusy] = useState(false);

    return (
        <PublicModal
            open={open}
            onClose={onClose}
            busy={busy}
            closeOnEscape={!imagePickerOpen}
            panelClassName="max-h-[calc(100dvh-24px)] max-w-[560px] overflow-y-auto rounded-[24px] border border-white/[0.07] bg-[#11171c] shadow-[0_28px_90px_rgba(0,0,0,.58)]"
        >
            <PlaylistCreateForm
                username={username}
                active={open}
                onCancel={onClose}
                onImagePickerOpenChange={setImagePickerOpen}
                onBusyChange={setBusy}
            />
        </PublicModal>
    );
}

export function PlaylistCreateForm({
    username,
    active = true,
    embedded = false,
    onCancel,
    onImagePickerOpenChange,
    onBusyChange,
}: {
    username: string;
    active?: boolean;
    embedded?: boolean;
    onCancel: () => void;
    onImagePickerOpenChange?: (open: boolean) => void;
    onBusyChange?: (busy: boolean) => void;
}) {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
    const [imagePickerOpen, setImagePickerOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createPlaylist, createState] = useCreatePublicPlaylistMutation();

    useEffect(() => {
        onImagePickerOpenChange?.(imagePickerOpen);
    }, [imagePickerOpen, onImagePickerOpenChange]);

    useEffect(() => {
        onBusyChange?.(createState.isLoading);
    }, [createState.isLoading, onBusyChange]);

    useEffect(() => {
        if (active) return;
        setTitle("");
        setDescription("");
        setIsPrivate(false);
        setSelectedImage(null);
        setImagePickerOpen(false);
        setError(null);
    }, [active]);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        if (!title.trim()) return;
        setError(null);

        try {
            const playlist = await createPlaylist({
                username,
                title: title.trim(),
                description: description.trim() || undefined,
                imageId: selectedImage?.id,
                isPrivate,
            }).unwrap();
            router.push(`/users/${encodeURIComponent(username)}/lists/${encodeURIComponent(playlist.slug)}`);
        } catch (requestError) {
            setError(getErrorMessage(requestError, "Не вдалося створити список."));
        }
    }

    const preview = imageSrc(selectedImage?.path);

    return (
        <>
            <form onSubmit={submit} className={cn(embedded ? "px-1 pb-2 pt-1" : "p-4 sm:p-5")}>
                {!embedded && (
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-[19px] font-medium text-white/92">Новий список</h2>
                            <p className="mt-1 text-[13px] leading-5 text-white/38">
                                Створи добірку та додай туди до 30 аніме у власному порядку.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={createState.isLoading}
                            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl bg-white/[0.045] text-white/45 transition hover:bg-white/[0.08] hover:text-white/75 disabled:opacity-50"
                            aria-label="Закрити"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                <div className={cn("space-y-4", !embedded && "mt-5")}>
                    <Field label="Назва" required>
                        <input
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            maxLength={80}
                            autoFocus={!embedded}
                            placeholder="Наприклад, Улюблене"
                            className="h-11 w-full rounded-xl border border-white/[0.055] bg-[#171d22] px-3.5 text-[14px] text-white/88 outline-none transition placeholder:text-white/25 focus:border-white/16 focus:bg-[#1a2026]"
                        />
                    </Field>

                    <Field label="Опис">
                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            maxLength={1200}
                            rows={4}
                            placeholder="Коротко опиши, що буде в цьому списку"
                            className="min-h-24 w-full resize-y rounded-xl border border-white/[0.055] bg-[#171d22] px-3.5 py-3 text-[14px] leading-5 text-white/88 outline-none transition placeholder:text-white/25 focus:border-white/16 focus:bg-[#1a2026]"
                        />
                    </Field>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.055] bg-[#171d22] p-3.5 transition hover:border-white/10">
                        <input
                            type="checkbox"
                            checked={isPrivate}
                            onChange={(event) => setIsPrivate(event.target.checked)}
                            className="mt-0.5 size-4 accent-[var(--primary)]"
                        />
                        <span className="min-w-0">
                            <span className="flex items-center gap-1.5 text-[13px] font-medium text-white/74">
                                <Lock size={14} /> Приватний список
                            </span>
                            <span className="mt-1 block text-[12px] leading-4 text-white/29">
                                Його бачиш лише ти. Він не з’явиться у профілі чи активності для інших користувачів.
                            </span>
                        </span>
                    </label>

                    <Field label="Зображення списку">
                        <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
                            <button
                                type="button"
                                onClick={() => setImagePickerOpen(true)}
                                className="group relative aspect-[16/10] overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c1115] text-white/22 transition hover:border-white/13"
                            >
                                {preview ? (
                                    <Image
                                        src={preview}
                                        alt=""
                                        fill
                                        unoptimized
                                        sizes="150px"
                                        className="object-cover transition duration-300 group-hover:scale-[1.025]"
                                    />
                                ) : (
                                    <span className="absolute inset-0 grid place-items-center">
                                        <ImagePlus size={25} />
                                    </span>
                                )}
                                <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/15" />
                            </button>

                            <div className="min-w-0">
                                <button
                                    type="button"
                                    onClick={() => setImagePickerOpen(true)}
                                    className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/[0.065] bg-white/[0.035] px-3 text-[13px] text-white/58 transition hover:bg-white/[0.065] hover:text-white/78"
                                >
                                    <ImagePlus size={16} />
                                    {selectedImage ? "Змінити зображення" : "Обрати зображення"}
                                </button>
                                {selectedImage && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedImage(null)}
                                        className="mt-2 flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-[12px] text-white/32 transition hover:bg-red-500/[0.06] hover:text-red-300/75"
                                    >
                                        <Trash2 size={14} />
                                        Прибрати
                                    </button>
                                )}
                                <p className="mt-2 text-[12px] leading-4 text-white/27">
                                    Можна обрати лише зображення, які адміністратор дозволив для використання користувачами.
                                </p>
                            </div>
                        </div>
                    </Field>
                </div>

                {error && (
                    <div className="mt-4 rounded-xl border border-red-400/15 bg-red-500/[0.07] px-3.5 py-2.5 text-[13px] text-red-200/85">
                        {error}
                    </div>
                )}

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={createState.isLoading}
                        className="h-10 cursor-pointer rounded-xl border border-white/[0.055] bg-white/[0.035] px-4 text-[14px] text-white/55 transition hover:bg-white/[0.07] hover:text-white/78 disabled:opacity-50"
                    >
                        {embedded ? "Назад" : "Скасувати"}
                    </button>
                    <button
                        type="submit"
                        disabled={createState.isLoading || title.trim().length < 2}
                        className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-(--primary) px-4 text-[14px] font-medium text-white transition hover:bg-(--primary-3) disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {createState.isLoading ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />}
                        Створити
                    </button>
                </div>
            </form>

            <PlaylistImagePickerModal
                username={username}
                open={imagePickerOpen}
                selectedId={selectedImage?.id ?? null}
                onClose={() => setImagePickerOpen(false)}
                onSelect={(image) => {
                    setSelectedImage(image);
                    setImagePickerOpen(false);
                }}
            />
        </>
    );
}

function Field({
    label,
    required = false,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[.08em] text-white/32">
                {label}{required ? " *" : ""}
            </span>
            {children}
        </label>
    );
}
