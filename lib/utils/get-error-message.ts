export const getErrorMessage = (error: unknown) => {
    if (!error || typeof error !== "object" || !("data" in error)) {
        return "Не вдалося виконати запит.";
    }

    const data = (error as { data?: unknown }).data;
    if (!data || typeof data !== "object" || !("message" in data)) {
        return "Не вдалося виконати запит.";
    }

    const message = (data as { message?: unknown }).message;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;

    return "Не вдалося виконати запит.";
}
