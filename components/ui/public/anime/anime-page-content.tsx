import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

import AnimeComments from "@/components/ui/public/anime/anime-comments";
import AnimeGallery from "@/components/ui/public/anime/anime-gallery";
import AnimeInfoPanel from "@/components/ui/public/anime/anime-info-panel";
import AnimeStrip from "@/components/ui/public/anime/anime-strip";
import AnimeWatch from "@/components/ui/public/anime/anime-watch";
import AnimeBadges from "@/components/ui/public/shared/anime-badges";
import type { PublicAnimeDetails } from "@/lib/types/public";
import { imageSrc } from "@/lib/utils/public-anime";

export default function AnimePageContent({ anime }: { anime: PublicAnimeDetails }) {
    const background = imageSrc(anime.additionalImages[0]?.path ?? anime.poster?.path);
    const poster = imageSrc(anime.poster?.path);

    return (
        <article className="relative isolate min-h-screen overflow-hidden bg-[#080c0f] pb-24 md:pb-12">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] overflow-hidden">
                {background && (
                    <Image
                        src={background}
                        alt=""
                        fill
                        priority
                        unoptimized
                        sizes="100vw"
                        className="scale-105 object-cover opacity-34 blur-[2px]"
                    />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,15,.38)_0%,rgba(8,12,15,.74)_48%,#080c0f_100%),linear-gradient(90deg,rgba(8,12,15,.72),rgba(8,12,15,.18),rgba(8,12,15,.68))]" />
            </div>

            <div className="mx-auto w-full max-w-[1480px] px-4 pt-4 sm:px-6 md:pt-[104px] lg:px-8">
                <nav className="mb-3 hidden items-center gap-1.5 rounded-xl border border-white/[0.045] bg-[#10161b]/88 px-3.5 py-2.5 text-[11px] text-white/30 backdrop-blur-xl md:flex">
                    <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-white/60">
                        <Home size={13} /> Головна
                    </Link>
                    <ChevronRight size={12} className="text-white/15" />
                    <Link href="/animes" className="transition hover:text-white/60">Аніме</Link>
                    <ChevronRight size={12} className="text-white/15" />
                    <span className="truncate text-white/48">{anime.title}</span>
                </nav>

                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-[#10161b]/86 p-3 backdrop-blur-xl md:hidden">
                    <div className="relative aspect-[3/4] w-[72px] shrink-0 overflow-hidden rounded-xl bg-white/[0.04]">
                        {poster && <Image src={poster} alt={anime.title} fill unoptimized sizes="72px" className="object-cover" />}
                    </div>
                    <div className="min-w-0">
                        <h1 className="line-clamp-2 text-[18px] font-semibold leading-tight text-white/90">{anime.title}</h1>
                        <div className="mt-2"><AnimeBadges anime={anime} compact /></div>
                    </div>
                </div>

                <div className="grid items-start gap-4 lg:grid-cols-[250px_minmax(0,1fr)]">
                    <div className="order-2 lg:order-1">
                        <AnimeInfoPanel anime={anime} />
                    </div>
                    <div className="order-1 min-w-0 space-y-4 lg:order-2">
                        <AnimeWatch anime={anime} />
                        <div className="hidden space-y-4 lg:block">
                            <AnimeStrip title="Рекомендації" items={anime.recommendations ?? []} compact />
                            <AnimeGallery title={anime.title} images={anime.additionalImages ?? []} />
                        </div>
                    </div>
                </div>

                <div className="mt-4 space-y-4 lg:hidden">
                    <AnimeStrip title="Рекомендації" items={anime.recommendations ?? []} />
                    <AnimeGallery title={anime.title} images={anime.additionalImages ?? []} />
                </div>
            </div>

            <div className="mt-5 border-t border-white/[0.035] pt-4">
                <AnimeComments slug={anime.slug} />
            </div>
        </article>
    );
}
