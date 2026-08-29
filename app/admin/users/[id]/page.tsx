"use client";

import { use } from "react";
import { notFound } from "next/navigation";

import {
    EntityEditError,
    EntityEditLoading,
} from "@/components/ui/admin/shared/entity-edit-state";
import UserEditor from "@/components/ui/admin/users/user-editor";
import { useGetUserQuery } from "@/lib/store/animi/user-endpoints";

export default function EditUserPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const entityId = Number(id);
    const isValidId = Number.isInteger(entityId) && entityId > 0;
    const { data, isLoading, error } = useGetUserQuery(
        isValidId ? entityId : 0,
        { skip: !isValidId },
    );

    if (!isValidId) notFound();

    if (isLoading) {
        return (
            <EntityEditLoading
                title="Редагування користувача"
                loadingText="Завантаження користувача..."
            />
        );
    }

    if (error || !data) {
        return (
            <EntityEditError
                title="Редагування користувача"
                errorTitle="Користувача не вдалося завантажити"
                error={error}
                fallbackMessage="Перевірте ID користувача та спробуйте ще раз."
                backHref="/admin/users"
                backLabel="Повернутися до користувачів"
            />
        );
    }

    return <UserEditor key={data.id} user={data} />;
}
