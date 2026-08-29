"use client";

import EntityStatsCard from "@/components/ui/admin/shared/entity-stats-card";
import TitleEntityEditor from "@/components/ui/admin/shared/title-entity-editor";
import {
    useCreatePlayerMutation,
    useUpdatePlayerMutation,
} from "@/lib/store/animi/player-endpoints";
import type { Player } from "@/lib/types/entites/player";
import type { PlayerStats } from "@/lib/types/admin-stats";

export default function PlayerEditor({ player, stats }: { player: Player | null; stats?: PlayerStats }) {
    const [createPlayer, createState] = useCreatePlayerMutation();
    const [updatePlayer, updateState] = useUpdatePlayerMutation();

    return (
        <TitleEntityEditor
            entity={player}
            returnHref="/admin/players"
            backLabel="Назад до плеєрів"
            createTitle="Створення плеєра"
            editTitle="Плеєр"
            placeholder="Наприклад, Ashdi"
            requiredMessage="Вкажіть назву плеєра."
            isSaving={createState.isLoading || updateState.isLoading}
            error={createState.error ?? updateState.error}
            onCreate={(title) => createPlayer({ title }).unwrap()}
            onUpdate={(id, title) =>
                updatePlayer({ id, body: { title } }).unwrap()
            }
            sidebar={
                stats ? (
                    <EntityStatsCard
                        metrics={[
                            { label: "Варіанти", value: stats.variants, hint: stats.variants ? `${Math.round((stats.activeVariants / stats.variants) * 100)}% активних` : undefined },
                            { label: "Активні", value: stats.activeVariants },
                            { label: "Серії", value: stats.episodes },
                            { label: "Аніме", value: stats.anime },
                            { label: "Команди", value: stats.dubTeams },
                        ]}
                    />
                ) : undefined
            }
        />
    );
}
