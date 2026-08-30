import { notFound } from "next/navigation";

import AnimePageContent from "@/components/ui/public/anime/anime-page-content";
import { backendUrl } from "@/lib/constants/api";
import type { PublicAnimeDetails } from "@/lib/types/public";

export const dynamic = "force-dynamic";

async function getAnime(slug: string): Promise<PublicAnimeDetails | null> {
    try {
        const response = await fetch(`${backendUrl}/api/public/anime/${encodeURIComponent(slug)}`, {
            cache: "no-store",
        });
        if (!response.ok) return null;
        return (await response.json()) as PublicAnimeDetails;
    } catch {
        return null;
    }
}

export default async function PublicAnimePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const anime = await getAnime(slug);
    if (!anime) notFound();

    return <AnimePageContent anime={anime} />;
}
