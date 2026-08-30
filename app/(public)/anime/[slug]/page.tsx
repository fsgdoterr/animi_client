import Image from "next/image";
import { notFound } from "next/navigation";

import AnimeBadges from "@/components/ui/public/shared/anime-badges";
import { backendUrl } from "@/lib/constants/api";
import type { PublicAnimeDetails } from "@/lib/types/public";
import { imageSrc } from "@/lib/utils/public-anime";

export const dynamic = "force-dynamic";

async function getAnime(slug: string): Promise<PublicAnimeDetails | null> {
    try {
        const response = await fetch(`${backendUrl}/api/public/anime/${encodeURIComponent(slug)}`, { cache: "no-store" });
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

    const background = imageSrc(anime.additionalImages?.[0]?.path ?? anime.poster?.path);
    const poster = imageSrc(anime.poster?.path);

    return (
        <article className="min-h-[100dvh] bg-[#080c0f] pb-20">
            <section className="relative min-h-[560px] overflow-hidden pt-36 sm:min-h-[620px]">
                {background && <Image src={background} alt="" fill priority unoptimized sizes="100vw" className="object-cover opacity-65" />}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,#080c0f_0%,rgba(8,12,15,.82)_34%,rgba(8,12,15,.28)_72%),linear-gradient(180deg,rgba(8,12,15,.25),#080c0f_95%)]" />
                <div className="relative z-10 mx-auto grid min-h-[520px] w-full max-w-[1300px] items-end gap-7 px-5 pb-12 sm:px-8 md:grid-cols-[220px_minmax(0,1fr)] lg:px-10">
                    <div className="relative hidden aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-[#11171c] shadow-2xl md:block">
                        {poster && <Image src={poster} alt={anime.title} fill unoptimized sizes="220px" className="object-cover" />}
                    </div>
                    <div className="max-w-3xl pb-1">
                        <AnimeBadges anime={anime} />
                        <h1 className="mt-4 text-[38px] font-semibold leading-[1.06] tracking-tight text-white sm:text-[52px]">{anime.title}</h1>
                        {(anime.engTitle || anime.originalTitle) && <p className="mt-2 text-sm text-white/38">{anime.engTitle || anime.originalTitle}</p>}
                        <p className="mt-5 max-w-3xl text-[14px] leading-6 text-white/58 sm:text-[15px]">{anime.description || "Опис поки що не додано."}</p>
                        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-white/35">
                            {anime.studio && <span>Студія: <b className="font-normal text-white/58">{anime.studio}</b></span>}
                            {anime.country && <span>Країна: <b className="font-normal text-white/58">{anime.country}</b></span>}
                            {anime.duration && <span>Тривалість: <b className="font-normal text-white/58">{anime.duration} хв</b></span>}
                        </div>
                    </div>
                </div>
            </section>
        </article>
    );
}
