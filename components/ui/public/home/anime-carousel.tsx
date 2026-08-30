"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";

import AnimeCard from "@/components/ui/public/home/anime-card";
import type { PublicAnimeCard } from "@/lib/types/public";

export default function AnimeCarousel({
    title,
    items,
}: {
    title: string;
    items: PublicAnimeCard[];
}) {
    const [swiper, setSwiper] = useState<SwiperInstance | null>(null);

    if (!items.length) return null;

    return (
        <section className="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8">
            <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
                <h2 className="text-[18px] font-medium tracking-tight text-white/90 sm:text-[20px]">{title}</h2>
                <div className="flex gap-1.5">
                    <SliderButton label="Назад" onClick={() => swiper?.slidePrev()}>
                        <ChevronLeft size={18} />
                    </SliderButton>
                    <SliderButton label="Вперед" onClick={() => swiper?.slideNext()}>
                        <ChevronRight size={18} />
                    </SliderButton>
                </div>
            </div>

            <Swiper
                modules={[A11y]}
                onSwiper={setSwiper}
                spaceBetween={10}
                slidesPerView={2.15}
                breakpoints={{
                    520: { slidesPerView: 3.15, spaceBetween: 12 },
                    760: { slidesPerView: 4.2, spaceBetween: 14 },
                    1024: { slidesPerView: 5.2, spaceBetween: 14 },
                    1280: { slidesPerView: 6.2, spaceBetween: 16 },
                }}
                className="!overflow-visible"
            >
                {items.map((anime) => (
                    <SwiperSlide key={anime.id} className="!h-auto">
                        <AnimeCard anime={anime} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}

function SliderButton({
    label,
    onClick,
    children,
}: {
    label: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="grid size-8 cursor-pointer place-items-center rounded-full border border-white/[0.06] bg-white/[0.045] text-white/50 transition hover:bg-white/[0.09] hover:text-white/85"
        >
            {children}
        </button>
    );
}
