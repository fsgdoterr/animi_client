import { Pencil, Trash2 } from "lucide-react";

import { IconButton } from "@/components/ui/buttons/icon-button";

interface EntityActionsProps {
    editHref: string;
    editLabel: string;
    deleteLabel: string;
    onDelete: () => void;
    deleteDisabled?: boolean;
}

export default function EntityActions({
    editHref,
    editLabel,
    deleteLabel,
    onDelete,
    deleteDisabled = false,
}: EntityActionsProps) {
    return (
        <div className="flex shrink-0 justify-end gap-2">
            <IconButton href={editHref} color="green" aria-label={editLabel}>
                <Pencil size={17} strokeWidth={1.8} />
            </IconButton>
            <IconButton
                type="button"
                color="red"
                onClick={onDelete}
                disabled={deleteDisabled}
                aria-label={deleteLabel}
            >
                <Trash2 size={17} strokeWidth={1.8} />
            </IconButton>
        </div>
    );
}
