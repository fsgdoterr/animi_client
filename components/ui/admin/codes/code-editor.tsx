"use client";

import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { useForm } from "react-hook-form";

import AnimeCodePicker from "./anime-code-picker";
import {
    EditorBody,
    EditorError,
    EditorHeader,
    EditorPanel,
    SystemInfoCard,
} from "@/components/ui/admin/shared/editor-layout";
import { FormField } from "@/components/ui/admin/shared/form-field";
import { Input } from "@/components/ui/inputs/input";
import {
    useCreateCodeMutation,
    useUpdateCodeMutation,
} from "@/lib/store/animi/code-endpoints";
import type { AnimeCode, AnimeCodePayload } from "@/lib/types/entites/code";

interface CodeFormValues {
    code: string;
    animeId: number | null;
}

export default function CodeEditor({ code }: { code: AnimeCode | null }) {
    const router = useRouter();
    const [createCode, createState] = useCreateCodeMutation();
    const [updateCode, updateState] = useUpdateCodeMutation();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, dirtyFields },
    } = useForm<CodeFormValues>({
        defaultValues: {
            code: code?.code ?? "",
            animeId: code?.animeId ?? null,
        },
    });

    const animeId = watch("animeId");

    function resetToInitial<K extends keyof CodeFormValues>(field: K) {
        const initialValues: CodeFormValues = {
            code: code?.code ?? "",
            animeId: code?.animeId ?? null,
        };
        setValue(field, initialValues[field], {
            shouldDirty: true,
            shouldTouch: false,
            shouldValidate: true,
        });
    }
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
                title={code ? "Редагування коду" : "Створення коду"}
                subtitle={code ? `${code.code} · ${code.anime.title} · #${code.id}` : undefined}
                isSaving={isSaving}
                submitLabel={code ? "Зберегти" : "Створити"}
            />
            <EditorError error={mutationError} />

            <EditorBody
                sidebar={
                    code ? (
                        <div className="grid gap-3">
                            <ViewsCard views={code._count.views} />
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
                                    reset={
                                        code
                                            ? {
                                                  disabled: !dirtyFields.code,
                                                  onClick: () => resetToInitial("code"),
                                                  ariaLabel: "Скинути код до початкового значення",
                                              }
                                            : undefined
                                    }
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
                                reset={
                                    code
                                        ? {
                                              disabled: !dirtyFields.animeId,
                                              onClick: () => resetToInitial("animeId"),
                                              ariaLabel: "Скинути аніме до початкового значення",
                                          }
                                        : undefined
                                }
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

function ViewsCard({ views }: { views: number }) {
    return (
        <section className="rounded-xl border border-white/[0.025] bg-[#11171c] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-[13px] text-white/35">Перегляди за кодом</p>
                    <p className="mt-1 text-[26px] leading-none text-white/88">
                        {views.toLocaleString("uk-UA")}
                    </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-white/[0.035] text-white/35">
                    <Eye size={19} />
                </div>
            </div>
        </section>
    );
}
