export function sortPageItems<T>(
    items: readonly T[] | undefined,
    mode: "new" | "old" | string,
    alphabeticalMode: string,
    getLabel: (item: T) => string,
) {
    const result = [...(items ?? [])];

    if (mode === "old") return result.reverse();
    if (mode === alphabeticalMode) {
        return result.sort((a, b) =>
            getLabel(a).localeCompare(getLabel(b), "uk", {
                sensitivity: "base",
            }),
        );
    }

    return result;
}
