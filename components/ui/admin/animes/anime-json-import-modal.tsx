"use client";

import { useEffect, useState } from "react";
import { Braces, Check } from "lucide-react";
import { z } from "zod";

import Modal from "@/components/ui/admin/shared/modal";
import { Button } from "@/components/ui/buttons/button";
import {
    AnimeRating,
    AnimeStatus,
    AnimeType,
    DubType,
    EpisodeSourceType,
} from "@/lib/types/entites/anime";

const nullableText = z.string().nullable().optional();
const nullableNonNegativeInt = z.number().int().nonnegative().nullable().optional();
const nullablePositiveInt = z.number().int().positive().nullable().optional();
const nullableHttpUrl = z
    .string()
    .refine(isHttpUrl, "Має бути коректний http/https URL.")
    .nullable()
    .optional();
const nullableDate = z
    .string()
    .refine(isDateInput, "Дата має бути у форматі YYYY-MM-DD.")
    .nullable()
    .optional();

const episodeVariantSchema = z
    .object({
        sourceType: z.nativeEnum(EpisodeSourceType).optional(),
        endpoint: z.string().trim().min(1, "endpoint не може бути порожнім."),
        dubType: z.nativeEnum(DubType),
        dubTeamId: z.number().int().positive(),
        playerId: z.number().int().positive(),
        isActive: z.boolean().optional(),
    })
    .strict();

const episodeSchema = z
    .object({
        number: z.number().int().positive(),
        title: z.string().nullable().optional(),
        variants: z.array(episodeVariantSchema).optional(),
    })
    .strict();

const animeImportSchema = z
    .object({
        title: z.string().optional(),
        originalTitle: nullableText,
        engTitle: nullableText,
        description: nullableText,
        type: z.nativeEnum(AnimeType).optional(),
        status: z.nativeEnum(AnimeStatus).optional(),
        rating: z.nativeEnum(AnimeRating).nullable().optional(),
        poster: z
            .union([
                z.number().int().positive(),
                z.string().refine(isHttpUrl, "Постер має бути http/https URL."),
                z.null(),
            ])
            .optional(),
        additionalImages: z
            .array(
                z.union([
                    z.number().int().positive(),
                    z.string().refine(isHttpUrl, "Зображення має бути http/https URL."),
                ]),
            )
            .optional(),
        genres: z.array(z.string().trim().min(1)).optional(),
        producers: z.array(z.string().trim().min(1)).optional(),
        relatedAnimeId: nullablePositiveInt,
        releaseDate: nullableDate,
        endDate: nullableDate,
        episodesTotal: nullableNonNegativeInt,
        seasonNumber: nullableNonNegativeInt,
        partNumber: nullableNonNegativeInt,
        duration: nullableNonNegativeInt,
        country: nullableText,
        studio: nullableText,
        mal: nullableHttpUrl,
        al: nullableHttpUrl,
        episodes: z.array(episodeSchema).optional(),
    })
    .strict()
    .superRefine((value, ctx) => {
        if (!value.episodes) return;

        const seen = new Set<number>();
        value.episodes.forEach((episode, index) => {
            if (seen.has(episode.number)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["episodes", index, "number"],
                    message: `Серія №${episode.number} вказана більше одного разу.`,
                });
            }
            seen.add(episode.number);
        });
    });

export type AnimeImportData = z.infer<typeof animeImportSchema>;

export default function AnimeJsonImportModal({
    open,
    onClose,
    onImport,
}: {
    open: boolean;
    onClose: () => void;
    onImport: (data: AnimeImportData) => void;
}) {
    const [json, setJson] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setError(null);
    }, [open]);

    function importJson() {
        setError(null);

        let raw: unknown;
        try {
            raw = JSON.parse(json);
        } catch (parseError) {
            setError(
                parseError instanceof Error
                    ? `Некоректний JSON: ${parseError.message}`
                    : "Некоректний JSON.",
            );
            return;
        }

        const result = animeImportSchema.safeParse(raw);
        if (!result.success) {
            const issue = result.error.issues[0];
            const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
            setError(`${path}${issue.message}`);
            return;
        }

        onImport(result.data);
        setJson("");
        onClose();
    }

    return (
        <Modal
            open={open}
            title="Імпорт даних з JSON"
            onClose={onClose}
            className="sm:w-[min(760px,calc(100vw-32px))]"
        >
            <div className="grid gap-4">
                <div className="rounded-lg border border-white/[0.055] bg-white/[0.025] px-3.5 py-3 text-[13px] leading-5 text-white/42">
                    <p>
                        Вставте JSON з даними аніме. Поле <code className="text-white/68">originalTitle</code> —
                        це назва ромадзі, дати — <code className="text-white/68">YYYY-MM-DD</code>.
                    </p>
                    <p className="mt-1.5">
                        Замінюються лише поля, які присутні в JSON. Якщо ключ
                        <code className="mx-1 text-white/68">episodes</code>
                        відсутній, список серій не змінюється.
                    </p>
                </div>

                <label className="grid gap-2">
                    <span className="flex items-center gap-2 text-[14px] text-white/72">
                        <Braces size={16} className="text-(--green)" />
                        JSON
                    </span>
                    <textarea
                        value={json}
                        onChange={(event) => {
                            setJson(event.target.value);
                            setError(null);
                        }}
                        autoFocus
                        spellCheck={false}
                        rows={18}
                        placeholder={'{\n  "title": "Наруто",\n  "originalTitle": "Naruto",\n  "type": "TV"\n}'}
                        className="min-h-[360px] w-full resize-y rounded-xl border border-white/[0.055] bg-[#0d1317] px-4 py-3 font-mono text-[13px] leading-5 text-white/86 outline-none transition placeholder:text-white/22 focus:border-white/15"
                    />
                </label>

                {error && (
                    <div className="rounded-lg border border-red-400/15 bg-red-500/[0.07] px-3.5 py-3 text-[13px] text-red-200/90">
                        {error}
                    </div>
                )}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 rounded-md border border-white/[0.07] bg-white/[0.035] px-4 text-[15px] text-white/62 transition hover:bg-white/[0.07] hover:text-white/85"
                    >
                        Скасувати
                    </button>
                    <Button
                        type="button"
                        color="green"
                        onClick={importJson}
                        disabled={!json.trim()}
                    >
                        <Check size={17} />
                        Імпортувати
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

function isHttpUrl(value: string) {
    try {
        const url = new URL(value.trim());
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function isDateInput(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}
