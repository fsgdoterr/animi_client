export async function runConfirmedMutation(
    message: string,
    mutation: () => Promise<unknown>,
) {
    if (!window.confirm(message)) return;

    try {
        await mutation();
    } catch {
        // Mutation errors are exposed by the RTK Query state on the calling page.
    }
}
