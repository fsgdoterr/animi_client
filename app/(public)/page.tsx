import HomeContent from "@/components/ui/public/home/home-content";
import { backendUrl } from "@/lib/constants/api";
import type { PublicHomeData } from "@/lib/types/public";

export const dynamic = "force-dynamic";

const emptyHome: PublicHomeData = {
    slider: [],
    latestAnime: [],
    latestEpisodes: [],
};

async function getHomeData(): Promise<PublicHomeData> {
    try {
        const response = await fetch(`${backendUrl}/api/public/anime/home`, {
            cache: "no-store",
        });
        if (!response.ok) return emptyHome;
        return (await response.json()) as PublicHomeData;
    } catch {
        return emptyHome;
    }
}

export default async function Home() {
    const data = await getHomeData();
    return <HomeContent data={data} />;
}
