import { cache } from "react";
import { cookies } from "next/headers";

import { backendUrl } from "@/lib/constants/api";
import type { PrivateUser } from "@/lib/types/entites/user";

export const getCurrentUser = cache(async (): Promise<PrivateUser | null> => {
    const cookieStore = await cookies();
    const session = cookieStore.get("userSession");

    if (!session) return null;

    const response = await fetch(`${backendUrl}/api/auth/me`, {
        headers: {
            cookie: `userSession=${session.value}`,
        },
        cache: "no-store",
    }).catch(() => null);

    if (!response?.ok) return null;

    return (await response.json()) as PrivateUser;
});

export async function getBackendSessionHeaders(): Promise<HeadersInit> {
    const cookieStore = await cookies();
    const session = cookieStore.get("userSession");

    return session ? { cookie: `userSession=${session.value}` } : {};
}
