"use client";

import EntityStatsCard from "@/components/ui/admin/shared/entity-stats-card";
import TitleEntityEditor from "@/components/ui/admin/shared/title-entity-editor";
import {
    useCreateDubTeamMutation,
    useUpdateDubTeamMutation,
} from "@/lib/store/animi/dub-team-endpoints";
import type { DubTeam } from "@/lib/types/entites/dub-team";
import type { DubTeamStats } from "@/lib/types/admin-stats";

export default function DubTeamEditor({ team, stats }: { team: DubTeam | null; stats?: DubTeamStats }) {
    const [createDubTeam, createState] = useCreateDubTeamMutation();
    const [updateDubTeam, updateState] = useUpdateDubTeamMutation();

    return (
        <TitleEntityEditor
            entity={team}
            returnHref="/admin/dub-teams"
            backLabel="Назад до команд озвучення"
            createTitle="Створення команди озвучення"
            editTitle="Команда озвучення"
            placeholder="Наприклад, Amanogawa"
            requiredMessage="Вкажіть назву команди озвучення."
            isSaving={createState.isLoading || updateState.isLoading}
            error={createState.error ?? updateState.error}
            onCreate={(title) => createDubTeam({ title }).unwrap()}
            onUpdate={(id, title) =>
                updateDubTeam({ id, body: { title } }).unwrap()
            }
            sidebar={
                stats ? (
                    <EntityStatsCard
                        metrics={[
                            { label: "Варіанти", value: stats.variants, hint: stats.variants ? `${Math.round((stats.activeVariants / stats.variants) * 100)}% активних` : undefined },
                            { label: "Активні", value: stats.activeVariants },
                            { label: "Серії", value: stats.episodes },
                            { label: "Аніме", value: stats.anime },
                            { label: "Плеєри", value: stats.players },
                        ]}
                    />
                ) : undefined
            }
        />
    );
}
