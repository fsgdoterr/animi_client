"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";

import AnimeBadges from "@/components/ui/public/shared/anime-badges";
import type { PublicAnimeCard } from "@/lib/types/public";
import { animeInstallmentLabel, animeTypeLabels, imageSrc } from "@/lib/utils/public-anime";

export default function AnimeStrip({
    title,
    items,
    compact = false,
}: {
    title: string;
    items: PublicAnimeCard[];
    compact?: boolean;
}) {
    const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
    if (!items.length) return null;

    return (
        <section className="overflow-hidden rounded-2xl border border-white/[0.055] bg-[#10161b]/96 p-3.5 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-[15px] font-medium text-white/78 sm:text-[16px]">{title}</h2>
                <div className="flex gap-1">
                    <StripButton label="Назад" onClick={() => swiper?.slidePrev()}><ChevronLeft size={16} /></StripButton>
                    <StripButton label="Вперед" onClick={() => swiper?.slideNext()}><ChevronRight size={16} /></StripButton>
                </div>
            </div>
            <Swiper
                modules={[A11y]}
                onSwiper={setSwiper}
                spaceBetween={10}
                slidesPerView={compact ? 1.7 : 1.55}
                breakpoints={
                    compact
                        ? {
                              520: { slidesPerView: 2.7, spaceBetween: 10 },
                              900: { slidesPerView: 3.5, spaceBetween: 10 },
                          }
                        : {
                              520: { slidesPerView: 2.3, spaceBetween: 12 },
                              760: { slidesPerView: 3.3, spaceBetween: 12 },
                              1024: { slidesPerView: 4.3, spaceBetween: 12 },
                              1280: { slidesPerView: 5.2, spaceBetween: 12 },
                          }
                }
            >
                {items.map((anime) => (
                    <SwiperSlide key={anime.id} className="!h-auto">
                        <StripCard anime={anime} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}

function StripCard({ anime }: { anime: PublicAnimeCard }) {
    const poster = imageSrc(anime.poster?.path);
    return (
        <Link href={`/anime/${anime.slug}`} className="group block min-w-0">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-white/[0.05] bg-[#161d22]">
                {poster && (
                    <Image
                        src={poster}
                        alt={anime.title}
                        fill
                        unoptimized
                        sizes="260px"
                        className="object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                )}
                <div className="absolute inset-0 bg-black/20 transition duration-300 group-hover:bg-black/14" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,12,.04)_5%,rgba(7,10,12,.28)_48%,rgba(7,10,12,.94)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-2.5">
                    <h3 className="truncate text-[13px] font-medium text-white/92">{anime.title}</h3>
                    <p className="mt-0.5 truncate text-[10px] font-medium text-white/48">
                        {[
                            animeTypeLabels[anime.type],
                            animeInstallmentLabel(anime.seasonNumber, anime.partNumber),
                        ]
                            .filter(Boolean)
                            .join(" · ")}
                    </p>
                    <div className="mt-1.5 origin-bottom-left scale-[.92]">
                        <AnimeBadges anime={anime} compact countsOnly />
                    </div>
                </div>
            </div>
        </Link>
    );
}

function StripButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="grid size-7 cursor-pointer place-items-center rounded-full bg-white/[0.055] text-white/45 transition hover:bg-white/[0.09] hover:text-white/80"
        >
            {children}
        </button>
    );
}
