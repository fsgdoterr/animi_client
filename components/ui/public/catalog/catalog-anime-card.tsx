import { Play, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import AnimeBadges from "@/components/ui/public/shared/anime-badges";
import type { PublicAnimeCard } from "@/lib/types/public";
import {
    animeRatingLabels,
    animeTypeLabels,
    compactDescription,
    imageSrc,
} from "@/lib/utils/public-anime";

export default function CatalogAnimeCard({ anime }: { anime: PublicAnimeCard }) {
    const poster = imageSrc(anime.poster?.path);
    const alternativeTitle = anime.engTitle || anime.originalTitle;
    const releaseYear = anime.releaseDate ? new Date(anime.releaseDate).getFullYear() : null;
    const averageReviewRating =
        typeof anime.averageReviewRating === "number" && Number.isFinite(anime.averageReviewRating)
            ? anime.averageReviewRating
            : null;

    return (
        <article className="group grid min-w-0 grid-cols-[104px_minmax(0,1fr)] gap-3 rounded-2xl border border-white/[0.045] bg-[#0d1318]/70 p-2.5 transition duration-200 hover:border-white/[0.08] hover:bg-[#11181e]/90 sm:grid-cols-[132px_minmax(0,1fr)] sm:gap-4 sm:p-3">
            <Link
                href={`/anime/${anime.slug}`}
                className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/[0.055] bg-[#141a20] shadow-[0_12px_30px_rgba(0,0,0,.2)]"
                aria-label={anime.title}
            >
                {poster ? (
                    <Image
                        src={poster}
                        alt={anime.title}
                        fill
                        unoptimized
                        sizes="132px"
                        className="object-cover transition duration-500 group-hover:scale-[1.035]"
                    />
                ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(97,84,214,.32),transparent_38%),linear-gradient(145deg,#1d2732,#0d1318)]" />
                )}
            </Link>

            <div className="flex min-w-0 flex-col py-0.5">
                <div className="min-w-0">
                    <Link href={`/anime/${anime.slug}`} className="block w-fit max-w-full">
                        <h2 className="truncate text-[15px] font-medium leading-5 text-white/90 transition group-hover:text-white sm:text-[17px]">
                            {anime.title}
                        </h2>
                    </Link>
                    {alternativeTitle && (
                        <p className="mt-0.5 truncate text-[11px] text-white/32 sm:text-[12px]">
                            {alternativeTitle}
                        </p>
                    )}
                </div>

                {anime.genres.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[10px] font-semibold uppercase tracking-wide text-white/52 sm:text-[11px]">
                        {anime.genres.slice(0, 4).map((genre) => (
                            <span key={genre.id}>{genre.title}</span>
                        ))}
                    </div>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {averageReviewRating !== null && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-1 text-[11px] font-medium leading-none text-amber-300">
                            <Star size={11} fill="currentColor" />
                            {averageReviewRating.toFixed(1)}
                        </span>
                    )}
                    {anime.rating && (
                        <span className="rounded-full border border-white/10 bg-white/[0.055] px-2 py-1 text-[11px] font-medium leading-none text-white/62">
                            {animeRatingLabels[anime.rating]}
                        </span>
                    )}
                    <AnimeBadges anime={anime} compact countsOnly />
                    <span className="text-[11px] text-white/38">{animeTypeLabels[anime.type]}</span>
                </div>

                <div className="mt-2 hidden flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/34 sm:flex">
                    {anime.country && <span>{anime.country}</span>}
                    {anime.studio && <span>{anime.studio}</span>}
                    {releaseYear && <span>{releaseYear}</span>}
                </div>

                <p className="mt-2 line-clamp-2 text-[11px] leading-[1.45] text-white/42 sm:mt-2.5 sm:text-[12px] sm:leading-[1.5]">
                    {compactDescription(anime.description, 230)}
                </p>

                <div className="mt-auto pt-2.5">
                    <Link
                        href={`/anime/${anime.slug}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-(--primary) px-3 text-[12px] font-medium text-white transition hover:brightness-110"
                    >
                        <Play size={13} fill="currentColor" />
                        Дивитись
                    </Link>
                </div>
            </div>
        </article>
    );
}
