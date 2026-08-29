const adminDateFormatter = new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
});

export const formatDate = (value: string) => {
    return adminDateFormatter.format(new Date(value)).replace(",", "");
};
