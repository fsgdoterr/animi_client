"use client";

import { Check, ImagePlus } from "lucide-react";
import { useEffect, useState } from "react";

import Modal from "@/components/ui/admin/shared/modal";
import { Button } from "@/components/ui/buttons/button";
import { Input } from "@/components/ui/inputs/input";
import { useCreateImageMutation } from "@/lib/store/animi/image-endpoints";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import cn from "@/lib/utils/cn";

export default function ImageCreateModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [url, setUrl] = useState("");
    const [isAvatarAllowed, setIsAvatarAllowed] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [createImage, state] = useCreateImageMutation();

    useEffect(() => {
        if (!open) return;
        setUrl("");
        setIsAvatarAllowed(false);
        setLocalError(null);
    }, [open]);

    async function submit() {
        const normalized = url.trim();
        try {
            const parsed = new URL(normalized);
            if (!["http:", "https:"].includes(parsed.protocol)) {
                setLocalError("Посилання має починатися з http:// або https://");
                return;
            }
        } catch {
            setLocalError("Вкажіть коректне пряме посилання на зображення.");
            return;
        }

        setLocalError(null);
        try {
            await createImage({ url: normalized, isAvatarAllowed }).unwrap();
            onClose();
        } catch {
            // RTK Query error is shown below.
        }
    }

    return (
        <Modal open={open} title="Додати зображення" onClose={onClose}>
            <div className="grid gap-5">
                <div>
                    <label className="mb-2 block text-[14px] text-white/70">
                        Пряме посилання
                    </label>
                    <Input
                        value={url}
                        onChange={(event) => {
                            setUrl(event.target.value);
                            setLocalError(null);
                        }}
                        autoFocus
                        inputMode="url"
                        placeholder="https://example.com/image.jpg"
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                void submit();
                            }
                        }}
                    />
                    <p className="mt-2 text-[13px] leading-5 text-white/32">
                        Сервер завантажить файл у локальне сховище. Максимальний
                        розмір — 20 МБ.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsAvatarAllowed((value) => !value)}
                    className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3.5 text-left transition hover:bg-white/[0.04]"
                >
                    <span
                        className={cn(
                            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition",
                            isAvatarAllowed
                                ? "border-(--green) bg-(--green) text-white"
                                : "border-white/15 bg-white/[0.02] text-transparent",
                        )}
                    >
                        <Check size={13} strokeWidth={2.5} />
                    </span>
                    <span>
                        <span className="block text-[14px] text-white/82">
                            Дозволити як аватар
                        </span>
                        <span className="mt-1 block text-[12px] leading-5 text-white/35">
                            Таке зображення не буде автоматично видалено після
                            відвʼязування від аніме або жанру та зʼявиться у
                            виборі аватарів.
                        </span>
                    </span>
                </button>

                {(localError || state.error) && (
                    <div className="rounded-lg border border-red-400/15 bg-red-500/[0.07] px-3 py-2.5 text-[13px] text-red-200/90">
                        {localError ?? getErrorMessage(state.error)}
                    </div>
                )}

                <div className="flex justify-end gap-2 border-t border-white/[0.06] pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                    >
                        Скасувати
                    </Button>
                    <Button
                        type="button"
                        color="green"
                        onClick={() => void submit()}
                        disabled={state.isLoading || !url.trim()}
                    >
                        <ImagePlus size={17} />
                        {state.isLoading ? "Завантаження..." : "Додати"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
