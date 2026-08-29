"use client";

import TitleEntityEditor from "@/components/ui/admin/shared/title-entity-editor";
import {
    useCreatePlayerMutation,
    useUpdatePlayerMutation,
} from "@/lib/store/animi/player-endpoints";
import type { Player } from "@/lib/types/entites/player";

export default function PlayerEditor({ player }: { player: Player | null }) {
    const [createPlayer, createState] = useCreatePlayerMutation();
    const [updatePlayer, updateState] = useUpdatePlayerMutation();

    return (
        <TitleEntityEditor
            entity={player}
            returnHref="/admin/players"
            backLabel="Назад до плеєрів"
            createTitle="Створення плеєра"
            editTitle="Редагування плеєра"
            placeholder="Наприклад, Ashdi"
            requiredMessage="Вкажіть назву плеєра."
            isSaving={createState.isLoading || updateState.isLoading}
            error={createState.error ?? updateState.error}
            onCreate={(title) => createPlayer({ title }).unwrap()}
            onUpdate={(id, title) =>
                updatePlayer({ id, body: { title } }).unwrap()
            }
        />
    );
}
