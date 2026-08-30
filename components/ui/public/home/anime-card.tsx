"use client";

import Image from "next/image";
import Link from "next/link";

import AnimeBadges from "@/components/ui/public/shared/anime-badges";
import type { PublicAnimeCard } from "@/lib/types/public";
import { imageSrc } from "@/lib/utils/public-anime";

export default function AnimeCard({ anime }: { anime: PublicAnimeCard }) {
    const poster = imageSrc(anime.poster?.path);

    return (
        <Link href={`/anime/${anime.slug}`} className="group block min-w-0">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/[0.055] bg-[#13191e] shadow-[0_12px_32px_rgba(0,0,0,.18)]">
                {poster ? (
                    <Image
                        src={poster}
                        alt={anime.title}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 42vw, (max-width: 1024px) 25vw, 210px"
                        className="object-cover transition duration-500 group-hover:scale-[1.035]"
                    />
                ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(228,95,58,.28),transparent_38%),linear-gradient(145deg,#1e2730,#0e1418)]" />
                )}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent opacity-80" />
                {anime.status === "ONGOING" && (
                    <span className="absolute right-2 top-2 rounded-full border border-orange-300/25 bg-orange-500/85 px-2 py-1 text-[12px] font-semibold uppercase tracking-wide text-white shadow-lg backdrop-blur-sm">
                        ongoing
                    </span>
                )}
            </div>

            <div className="px-0.5 pt-2.5">
                <h3 className="truncate text-[14px] font-medium text-white/82 transition group-hover:text-white sm:text-[15px]">
                    {anime.title}
                </h3>
                <div className="mt-2">
                    <AnimeBadges anime={anime} compact countsOnly />
                </div>
            </div>
        </Link>
    );
}
