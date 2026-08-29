"use client";

import { use, type ReactNode } from "react";
import { notFound } from "next/navigation";

import {
    EntityEditError,
    EntityEditLoading,
} from "@/components/ui/admin/shared/entity-edit-state";

export type EntityEditLabels = {
    title: string;
    loadingText: string;
    errorTitle: string;
    fallbackMessage: string;
    backHref: string;
    backLabel: string;
};

export function useEntityId(params: Promise<{ id: string }>) {
    const id = Number(use(params).id);
    return Number.isInteger(id) && id > 0 ? id : null;
}

export default function EntityEditPage<T>({
    entityId,
    data,
    isLoading,
    error,
    labels,
    render,
}: {
    entityId: number | null;
    data?: T;
    isLoading: boolean;
    error?: unknown;
    labels: EntityEditLabels;
    render: (entity: T) => ReactNode;
}) {
    if (entityId === null) notFound();

    if (isLoading) {
        return (
            <EntityEditLoading
                title={labels.title}
                loadingText={labels.loadingText}
            />
        );
    }

    if (error || !data) {
        return (
            <EntityEditError
                title={labels.title}
                errorTitle={labels.errorTitle}
                error={error}
                fallbackMessage={labels.fallbackMessage}
                backHref={labels.backHref}
                backLabel={labels.backLabel}
            />
        );
    }

    return render(data);
}
