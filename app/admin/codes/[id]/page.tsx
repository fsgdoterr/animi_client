"use client";

import CodeEditor from "@/components/ui/admin/codes/code-editor";
import EntityEditPage, {
    useEntityId,
} from "@/components/ui/admin/shared/entity-edit-page";
import { useGetCodeQuery } from "@/lib/store/animi/code-endpoints";

export default function EditCodePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const entityId = useEntityId(params);
    const { data, isLoading, error } = useGetCodeQuery(entityId ?? 0, {
        skip: entityId === null,
    });

    return (
        <EntityEditPage
            entityId={entityId}
            data={data}
            isLoading={isLoading}
            error={error}
            labels={{
                title: "Редагування коду",
                loadingText: "Завантаження коду...",
                errorTitle: "Код не вдалося завантажити",
                fallbackMessage: "Перевірте ID коду та спробуйте ще раз.",
                backHref: "/admin/codes",
                backLabel: "Повернутися до кодів",
            }}
            render={(entity) => <CodeEditor key={entity.id} code={entity} />}
        />
    );
}
