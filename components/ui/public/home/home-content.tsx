"use client";

import AnimeCarousel from "@/components/ui/public/home/anime-carousel";
import HeroSlider from "@/components/ui/public/home/hero-slider";
import type { PublicHomeData, PublicHomeSliderItem } from "@/lib/types/public";

export default function HomeContent({ data }: { data: PublicHomeData }) {
    const slider: PublicHomeSliderItem[] = data.slider.length
        ? data.slider
        : data.latestAnime.slice(0, 5).map((anime, index) => ({
              id: -anime.id,
              order: index,
              anime,
              image: null,
          }));

    return (
        <div className="overflow-hidden bg-[#080c0f]">
            <HeroSlider items={slider} />
            <div className="relative z-10 space-y-10 pb-20 pt-8 sm:space-y-14 sm:pb-28 sm:pt-10">
                <AnimeCarousel title="Новинки" items={data.latestAnime} />
                <AnimeCarousel title="Останні додані серії" items={data.latestEpisodes} />
            </div>
        </div>
    );
}
