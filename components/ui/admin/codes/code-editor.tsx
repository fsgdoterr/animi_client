"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import AnimeCodePicker from "./anime-code-picker";
import EntityStatsCard from "@/components/ui/admin/shared/entity-stats-card";
import {
    EditorBody,
    EditorError,
    EditorHeader,
    EditorPanel,
    SystemInfoCard,
} from "@/components/ui/admin/shared/editor-layout";
import { createFieldReset } from "@/components/ui/admin/shared/field-reset-config";
import { FormField } from "@/components/ui/admin/shared/form-field";
import { Input } from "@/components/ui/inputs/input";
import {
    useCreateCodeMutation,
    useUpdateCodeMutation,
} from "@/lib/store/animi/code-endpoints";
import type { AnimeCode, AnimeCodePayload } from "@/lib/types/entites/code";
import type { CodeStats } from "@/lib/types/admin-stats";
import { formatDate } from "@/lib/utils/format-date";

interface CodeFormValues {
    code: string;
    animeId: number | null;
}

export default function CodeEditor({ code, stats }: { code: AnimeCode | null; stats?: CodeStats }) {
    const router = useRouter();
    const [createCode, createState] = useCreateCodeMutation();
    const [updateCode, updateState] = useUpdateCodeMutation();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        resetField,
        formState: { errors, dirtyFields },
    } = useForm<CodeFormValues>({
        defaultValues: {
            code: code?.code ?? "",
            animeId: code?.animeId ?? null,
        },
    });

    const animeId = watch("animeId");

    const fieldReset = (field: keyof CodeFormValues, ariaLabel: string) =>
        createFieldReset(
            Boolean(code),
            dirtyFields[field],
            () => resetField(field),
            ariaLabel,
        );

    const isSaving = createState.isLoading || updateState.isLoading;
    const mutationError = createState.error ?? updateState.error;

    const onSubmit = handleSubmit(async (values) => {
        if (!values.animeId) return;

        const normalizedCode = values.code.trim();

        try {
            if (code) {
                const body: Partial<AnimeCodePayload> = {};
                if (dirtyFields.code) body.code = normalizedCode;
                if (dirtyFields.animeId) body.animeId = values.animeId;

                if (Object.keys(body).length > 0) {
                    await updateCode({ id: code.id, body }).unwrap();
                }
            } else {
                await createCode({
                    code: normalizedCode,
                    animeId: values.animeId,
                }).unwrap();
            }

            router.push("/admin/codes");
        } catch {
            // Mutation error is rendered below the header.
        }
    });

    return (
        <form
            onSubmit={onSubmit}
            className="flex min-h-full min-w-0 flex-1 flex-col lg:h-full lg:min-h-0"
        >
            <EditorHeader
                backHref="/admin/codes"
                backLabel="Назад до кодів"
                title={code ? "Код" : "Створення коду"}
                subtitle={code ? `${code.code} · ${code.anime.title} · #${code.id}` : undefined}
                isSaving={isSaving}
                submitLabel={code ? "Зберегти" : "Створити"}
            />
            <EditorError error={mutationError} />

            <EditorBody
                sidebar={
                    code ? (
                        <div className="grid gap-3">
                            {stats && (
                                <EntityStatsCard
                                    title="Трафік коду"
                                    metrics={[
                                        { label: "Усього", value: stats.views },
                                        { label: "7 днів", value: stats.views7 },
                                        { label: "30 днів", value: stats.views30 },
                                        { label: "Авторизовані", value: stats.authorizedViews },
                                    ]}
                                />
                            )}
                            {stats?.lastViewedAt && (
                                <div className="rounded-xl border border-white/[0.025] bg-[#11171c] px-4 py-3 text-[12px] text-white/34">
                                    Останній перегляд: <span className="text-white/62">{formatDate(stats.lastViewedAt)}</span>
                                </div>
                            )}
                            <SystemInfoCard
                                id={code.id}
                                createdAt={code.createdAt}
                                updatedAt={code.updatedAt}
                            />
                        </div>
                    ) : undefined
                }
            >
                <EditorPanel>
                    <div className="grid gap-7">
                        <section>
                            <h2 className="mb-5 text-[17px] font-medium text-white/88">
                                Основна інформація
                            </h2>
                            <div className="grid gap-5">
                                <FormField
                                    label="Код"
                                    htmlFor="anime-code"
                                    reset={fieldReset(
                                        "code",
                                        "Скинути код до початкового значення",
                                    )}
                                    error={errors.code?.message}
                                >
                                    <Input
                                        id="anime-code"
                                        {...register("code", {
                                            required: "Вкажіть код.",
                                            validate: (value) =>
                                                value.trim().length > 0 || "Код не може бути порожнім.",
                                        })}
                                        autoFocus={!code}
                                        placeholder="Наприклад, NARUTO-001"
                                        autoComplete="off"
                                        spellCheck={false}
                                        className="h-12 bg-[#181e23] font-mono tracking-[0.04em]"
                                    />
                                    <p className="text-[12px] leading-5 text-white/30">
                                        Код має бути унікальним. Регістр символів при перевірці дубліката не враховується.
                                    </p>
                                </FormField>
                            </div>
                        </section>

                        <section className="border-t border-white/[0.055] pt-6">
                            <FormField
                                label="Аніме"
                                reset={fieldReset(
                                    "animeId",
                                    "Скинути аніме до початкового значення",
                                )}
                                error={errors.animeId?.message}
                            >
                                <input
                                    type="hidden"
                                    {...register("animeId", {
                                        validate: (value) =>
                                            (typeof value === "number" && value > 0) || "Виберіть аніме.",
                                    })}
                                />
                                <AnimeCodePicker
                                    value={animeId}
                                    initialAnime={code?.anime ?? null}
                                    onChange={(anime) =>
                                        setValue("animeId", anime.id, {
                                            shouldDirty: true,
                                            shouldTouch: true,
                                            shouldValidate: true,
                                        })
                                    }
                                />
                            </FormField>
                        </section>
                    </div>
                </EditorPanel>
            </EditorBody>
        </form>
    );
}
