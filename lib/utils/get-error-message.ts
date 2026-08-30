export const getErrorMessage = (error: unknown, fallback = "Не вдалося виконати запит.") => {
    if (!error || typeof error !== "object" || !("data" in error)) {
        return fallback;
    }

    const data = (error as { data?: unknown }).data;
    if (!data || typeof data !== "object" || !("message" in data)) {
        return fallback;
    }

    const message = (data as { message?: unknown }).message;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;

    return fallback;
}
