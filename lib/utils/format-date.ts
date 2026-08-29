export const formatDate = (value: string) => {
    return new Intl.DateTimeFormat("uk-UA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}