import type { PublicAnimeCard, PublicSearchAnimeItem } from "@/lib/types/public";
import { AnimeStatus } from "@/lib/types/entites/anime";
import { animeRatingLabels, animeStatusLabels, animeTypeLabels } from "@/lib/utils/public-anime";
import cn from "@/lib/utils/cn";

type AnimeLike = Pick<
    PublicAnimeCard | PublicSearchAnimeItem,
    "type" | "status" | "rating" | "episodesTotal" | "dubEpisodesCount" | "subEpisodesCount"
>;

export default function AnimeBadges({
    anime,
    compact = false,
    countsOnly = false,
}: {
    anime: AnimeLike;
    compact?: boolean;
    countsOnly?: boolean;
}) {
    return (
        <div className={cn("min-w-0", compact ? "space-y-1" : "space-y-1.5")}>
            <div className={cn("flex flex-wrap items-center gap-1.5", compact && "gap-1")}>
                <Badge tone="neutral" compact={compact}>
                    {anime.episodesTotal ?? "XX"} сер.
                </Badge>
                <Badge tone="dub" compact={compact}>
                    {anime.dubEpisodesCount} озв.
                </Badge>
                <Badge tone="sub" compact={compact}>
                    {anime.subEpisodesCount} суб.
                </Badge>
            </div>

            {!countsOnly && (
                <div className={cn("flex flex-wrap items-center gap-1.5", compact && "gap-1")}>
                    <span className={cn("font-medium text-white/46", compact ? "text-[11px]" : "text-[12px]")}>
                        {animeTypeLabels[anime.type]}
                    </span>
                    {anime.rating && (
                        <Badge tone="rating" compact={compact}>
                            {animeRatingLabels[anime.rating]}
                        </Badge>
                    )}
                    {anime.status === AnimeStatus.ONGOING && (
                        <Badge tone="ongoing" compact={compact}>
                            {animeStatusLabels[anime.status]}
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}

function Badge({
    children,
    tone,
    compact,
}: {
    children: React.ReactNode;
    tone: "neutral" | "dub" | "sub" | "rating" | "ongoing";
    compact: boolean;
}) {
    const toneClass = {
        neutral: "border-white/12 bg-white/8 text-white/62",
        dub: "border-emerald-400/32 bg-emerald-400/10 text-emerald-300",
        sub: "text-(--primary-2) [border-color:color-mix(in_srgb,var(--primary-2)_34%,transparent)] [background-color:color-mix(in_srgb,var(--primary-2)_11%,transparent)]",
        rating: "border-amber-400/30 bg-amber-400/10 text-amber-300",
        ongoing: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    }[tone];

    return (
        <span
            className={cn(
                "rounded-full border font-medium leading-none",
                compact ? "px-1.5 py-1 text-[11px]" : "px-2 py-1 text-[12px]",
                toneClass,
            )}
        >
            {children}
        </span>
    );
}
