import { notFound } from "next/navigation";

import UserProfileContent from "@/components/ui/public/user/user-profile-content";
import { getBackendSessionHeaders } from "@/lib/auth/server";
import { backendUrl } from "@/lib/constants/api";
import type { PublicUserActivityResult, PublicUserProfile } from "@/lib/types/public";

export const dynamic = "force-dynamic";

async function getProfile(username: string) {
    const encoded = encodeURIComponent(username);
    try {
        const headers = await getBackendSessionHeaders();
        const [profileResponse, activityResponse] = await Promise.all([
            fetch(`${backendUrl}/api/public/users/${encoded}`, { cache: "no-store", headers }),
            fetch(`${backendUrl}/api/public/users/${encoded}/activity?limit=8`, { cache: "no-store", headers }),
        ]);
        if (!profileResponse.ok || !activityResponse.ok) return null;
        return {
            profile: (await profileResponse.json()) as PublicUserProfile,
            activity: (await activityResponse.json()) as PublicUserActivityResult,
        };
    } catch {
        return null;
    }
}

export default async function PublicUserPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const data = await getProfile(username);
    if (!data) return notFound();

    return <UserProfileContent profile={data.profile} activity={data.activity} />;
}
