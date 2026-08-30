import { notFound } from "next/navigation";

import PlaylistDetailContent from "@/components/ui/public/user/playlist-detail-content";
import { getBackendSessionHeaders } from "@/lib/auth/server";
import { backendUrl } from "@/lib/constants/api";
import type { PublicPlaylistDetail } from "@/lib/types/public";

export const dynamic = "force-dynamic";

async function getPlaylist(username: string, slug: string): Promise<PublicPlaylistDetail | null> {
    try {
        const headers = await getBackendSessionHeaders();
        const response = await fetch(
            `${backendUrl}/api/public/users/${encodeURIComponent(username)}/lists/${encodeURIComponent(slug)}`,
            { cache: "no-store", headers },
        );
        if (!response.ok) return null;
        return (await response.json()) as PublicPlaylistDetail;
    } catch {
        return null;
    }
}

export default async function PublicPlaylistPage({
    params,
}: {
    params: Promise<{ username: string; slug: string }>;
}) {
    const { username, slug } = await params;
    const playlist = await getPlaylist(username, slug);
    if (!playlist) return notFound();

    return <PlaylistDetailContent playlist={playlist} />;
}
