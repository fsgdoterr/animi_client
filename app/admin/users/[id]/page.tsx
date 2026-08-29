"use client";

import UserEditor from "@/components/ui/admin/users/user-editor";
import EntityEditPage, {
    useEntityId,
} from "@/components/ui/admin/shared/entity-edit-page";
import { useGetUserQuery } from "@/lib/store/animi/user-endpoints";

export default function EditUserPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const entityId = useEntityId(params);
    const { data, isLoading, error } = useGetUserQuery(entityId ?? 0, {
        skip: entityId === null,
    });

    return (
        <EntityEditPage
            entityId={entityId}
            data={data}
            isLoading={isLoading}
            error={error}
            labels={{
                title: "Редагування користувача",
                loadingText: "Завантаження користувача...",
                errorTitle: "Користувача не вдалося завантажити",
                fallbackMessage: "Перевірте ID користувача та спробуйте ще раз.",
                backHref: "/admin/users",
                backLabel: "Повернутися до користувачів",
            }}
            render={(entity) => <UserEditor key={entity.id} user={entity} />}
        />
    );
}
