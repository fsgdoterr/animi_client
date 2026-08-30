import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import AnimeDescription from "@/components/ui/public/anime/anime-description";
import AnimeRating from "@/components/ui/public/anime/anime-rating";
import AnimeBadges from "@/components/ui/public/shared/anime-badges";
import type { PublicAnimeDetails } from "@/lib/types/public";
import { animeStatusLabels, imageSrc } from "@/lib/utils/public-anime";

function formatDate(value: string | null) {
    if (!value) return null;
    return new Intl.DateTimeFormat("uk-UA", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

export default function AnimeInfoPanel({ anime }: { anime: PublicAnimeDetails }) {
    const poster = imageSrc(anime.poster?.path);
    const releaseDate = formatDate(anime.releaseDate);
    const endDate = formatDate(anime.endDate);
    const format = [
        anime.seasonNumber ? `Сезон ${anime.seasonNumber}` : null,
        anime.partNumber ? `частина ${anime.partNumber}` : null,
        anime.duration ? `${anime.duration} хв` : null,
    ]
        .filter(Boolean)
        .join(" · ");

    return (
        <aside className="overflow-hidden rounded-2xl border border-white/[0.055] bg-[#10161b]/96 shadow-[0_24px_70px_rgba(0,0,0,.24)]">
            <div className="relative hidden aspect-[4/5] bg-[#151b20] lg:block">
                {poster ? (
                    <Image
                        src={poster}
                        alt={anime.title}
                        fill
                        priority
                        unoptimized
                        sizes="250px"
                        className="object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(228,95,58,.24),transparent_38%),linear-gradient(145deg,#202a31,#10161b)]" />
                )}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#10161b] to-transparent" />
            </div>

            <div className="space-y-3 px-4 pb-3 pt-1">
                <div>
                    <h1 className="text-[18px] font-semibold leading-tight text-white/92">{anime.title}</h1>
                    {(anime.originalTitle || anime.engTitle) && (
                        <div className="mt-1 space-y-0.5 text-[10px] leading-snug text-white/28">
                            {anime.originalTitle && <p className="truncate">{anime.originalTitle}</p>}
                            {anime.engTitle && anime.engTitle !== anime.originalTitle && <p className="truncate">{anime.engTitle}</p>}
                        </div>
                    )}
                </div>

                <AnimeBadges anime={anime} compact />
                <AnimeDescription description={anime.description} />

                <dl className="space-y-1.5 text-[11px] leading-[1.45]">
                    <InfoRow label="Країна" value={anime.country} />
                    <InfoRow
                        label="Жанри"
                        value={anime.genres.length ? anime.genres.map((genre) => genre.title).join(", ") : null}
                        clamp
                    />
                    <InfoRow label="Студія" value={anime.studio} />
                    <InfoRow
                        label="Продюсери"
                        value={anime.producers.length ? anime.producers.map((producer) => producer.title).join(", ") : null}
                        clamp
                    />
                    <InfoRow
                        label="Трансляція"
                        value={releaseDate ? `${releaseDate}${endDate ? ` — ${endDate}` : ""}` : null}
                    />
                    <InfoRow label="Формат" value={format || null} />
                    <InfoRow
                        label="Епізоди"
                        value={anime.episodesTotal ? `${anime.episodesTotal}` : anime.episodes?.length ? `${anime.episodes.length}` : null}
                    />
                    <InfoRow label="Статус" value={animeStatusLabels[anime.status]} />
                </dl>

                {(anime.mal || anime.al) && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {anime.mal && <ExternalMetaLink href={anime.mal} label="MyAnimeList" />}
                        {anime.al && <ExternalMetaLink href={anime.al} label="AniList" />}
                    </div>
                )}
            </div>

            <AnimeRating
                slug={anime.slug}
                average={anime.averageReviewRating}
                reviewsCount={anime._count.reviews}
            />
        </aside>
    );
}

function InfoRow({
    label,
    value,
    clamp = false,
}: {
    label: string;
    value: string | null | undefined;
    clamp?: boolean;
}) {
    if (!value) return null;
    return (
        <div className="grid grid-cols-[70px_minmax(0,1fr)] gap-2">
            <dt className="text-white/25">{label}</dt>
            <dd className={clamp ? "line-clamp-2 text-white/58" : "text-white/58"}>{value}</dd>
        </div>
    );
}

function ExternalMetaLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-white/[0.055] bg-white/[0.03] px-2 py-1 text-[10px] text-white/40 transition hover:bg-white/[0.07] hover:text-white/70"
        >
            {label}
            <ExternalLink size={10} />
        </Link>
    );
}
