"use client";

import { use } from "react";
import { notFound } from "next/navigation";

import CodeEditor from "@/components/ui/admin/codes/code-editor";
import {
    EntityEditError,
    EntityEditLoading,
} from "@/components/ui/admin/shared/entity-edit-state";
import { useGetCodeQuery } from "@/lib/store/animi/code-endpoints";

export default function EditCodePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const codeId = Number(id);
    const isValidCodeId = Number.isInteger(codeId) && codeId > 0;
    const { data, isLoading, error } = useGetCodeQuery(
        isValidCodeId ? codeId : 0,
        { skip: !isValidCodeId },
    );

    if (!isValidCodeId) notFound();

    if (isLoading) {
        return (
            <EntityEditLoading
                title="Редагування коду"
                loadingText="Завантаження коду..."
            />
        );
    }

    if (error || !data) {
        return (
            <EntityEditError
                title="Редагування коду"
                errorTitle="Код не вдалося завантажити"
                error={error}
                fallbackMessage="Перевірте ID коду та спробуйте ще раз."
                backHref="/admin/codes"
                backLabel="Повернутися до кодів"
            />
        );
    }

    return <CodeEditor key={data.id} code={data} />;
}
