"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

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

type TitleEntity = {
    id: number;
    title: string;
    createdAt: string;
    updatedAt: string;
};

type FormValues = { title: string };

export default function TitleEntityEditor<T extends TitleEntity>({
    entity,
    returnHref,
    backLabel,
    createTitle,
    editTitle,
    placeholder,
    requiredMessage,
    isSaving,
    error,
    onCreate,
    onUpdate,
}: {
    entity: T | null;
    returnHref: string;
    backLabel: string;
    createTitle: string;
    editTitle: string;
    placeholder: string;
    requiredMessage: string;
    isSaving: boolean;
    error: unknown;
    onCreate: (title: string) => Promise<unknown>;
    onUpdate: (id: number, title: string) => Promise<unknown>;
}) {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        resetField,
        formState: { errors, dirtyFields },
    } = useForm<FormValues>({
        defaultValues: { title: entity?.title ?? "" },
    });

    const onSubmit = handleSubmit(async ({ title: rawTitle }) => {
        const title = rawTitle.trim();

        try {
            if (entity) {
                if (dirtyFields.title) await onUpdate(entity.id, title);
            } else {
                await onCreate(title);
            }
            router.push(returnHref);
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
                backHref={returnHref}
                backLabel={backLabel}
                title={entity ? editTitle : createTitle}
                subtitle={entity ? `${entity.title} · #${entity.id}` : undefined}
                isSaving={isSaving}
                submitLabel={entity ? "Зберегти" : "Створити"}
            />
            <EditorError error={error} />
            <EditorBody
                sidebar={
                    entity ? (
                        <SystemInfoCard
                            id={entity.id}
                            createdAt={entity.createdAt}
                            updatedAt={entity.updatedAt}
                        />
                    ) : undefined
                }
            >
                <EditorPanel>
                    <h2 className="mb-6 text-[17px] font-medium text-white/88">
                        Основна інформація
                    </h2>
                    <FormField
                        label="Назва"
                        htmlFor="entity-title"
                        reset={createFieldReset(
                            Boolean(entity),
                            dirtyFields.title,
                            () => resetField("title"),
                            "Скинути назву до початкового значення",
                        )}
                        error={errors.title?.message}
                    >
                        <Input
                            id="entity-title"
                            {...register("title", {
                                required: requiredMessage,
                                validate: (value) =>
                                    value.trim().length > 0 || requiredMessage,
                            })}
                            autoFocus={!entity}
                            placeholder={placeholder}
                            className="h-12 bg-[#181e23]"
                        />
                    </FormField>
                </EditorPanel>
            </EditorBody>
        </form>
    );
}
