"use client";

import TitleEntityEditor from "@/components/ui/admin/shared/title-entity-editor";
import {
    useCreateDubTeamMutation,
    useUpdateDubTeamMutation,
} from "@/lib/store/animi/dub-team-endpoints";
import type { DubTeam } from "@/lib/types/entites/dub-team";

export default function DubTeamEditor({ team }: { team: DubTeam | null }) {
    const [createDubTeam, createState] = useCreateDubTeamMutation();
    const [updateDubTeam, updateState] = useUpdateDubTeamMutation();

    return (
        <TitleEntityEditor
            entity={team}
            returnHref="/admin/dub-teams"
            backLabel="Назад до команд озвучення"
            createTitle="Створення команди озвучення"
            editTitle="Редагування команди озвучення"
            placeholder="Наприклад, Amanogawa"
            requiredMessage="Вкажіть назву команди озвучення."
            isSaving={createState.isLoading || updateState.isLoading}
            error={createState.error ?? updateState.error}
            onCreate={(title) => createDubTeam({ title }).unwrap()}
            onUpdate={(id, title) =>
                updateDubTeam({ id, body: { title } }).unwrap()
            }
        />
    );
}
