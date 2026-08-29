export type FieldResetConfig = {
    disabled: boolean;
    onClick: () => void;
    ariaLabel: string;
};

export function createFieldReset(
    enabled: boolean,
    dirty: unknown,
    onClick: () => void,
    ariaLabel: string,
): FieldResetConfig | undefined {
    if (!enabled) return undefined;

    return {
        disabled: !Boolean(dirty),
        onClick,
        ariaLabel,
    };
}
