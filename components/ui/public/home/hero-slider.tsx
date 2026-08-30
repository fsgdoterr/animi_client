"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";

import AnimeBadges from "@/components/ui/public/shared/anime-badges";
import type { PublicHomeSliderItem } from "@/lib/types/public";
import { compactDescription, imageSrc } from "@/lib/utils/public-anime";

export default function HeroSlider({ items }: { items: PublicHomeSliderItem[] }) {
    const [swiper, setSwiper] = useState<SwiperInstance | null>(null);

    if (!items.length) {
        return (
            <section className="relative min-h-[500px] overflow-hidden bg-[radial-gradient(circle_at_50%_20%,#25313a_0%,#11171c_38%,#080c0f_75%)] pt-24 sm:min-h-[560px]">
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#080c0f] to-transparent" />
            </section>
        );
    }

    return (
        <section className="relative overflow-hidden">
            <Swiper
                modules={[Autoplay, EffectFade, Pagination]}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                loop={items.length > 1}
                autoplay={items.length > 1 ? { delay: 6500, disableOnInteraction: false } : false}
                pagination={{ clickable: true }}
                onSwiper={setSwiper}
                className="public-hero-swiper"
            >
                {items.map((slide) => {
                    const anime = slide.anime;
                    const background = imageSrc(slide.image?.path ?? anime.poster?.path);
                    const secondaryTitle = anime.engTitle || anime.originalTitle;

                    return (
                        <SwiperSlide key={slide.id}>
                            <div className="relative min-h-[530px] sm:min-h-[610px] lg:min-h-[670px]">
                                {background && (
                                    <Image
                                        src={background}
                                        alt=""
                                        fill
                                        priority={slide.order === 0}
                                        unoptimized
                                        sizes="100vw"
                                        className="object-cover object-center"
                                    />
                                )}
                                {!background && (
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_28%,rgba(228,95,58,.26),transparent_30%),linear-gradient(135deg,#24303a,#0c1115_58%)]" />
                                )}

                                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,10,.92)_0%,rgba(5,8,10,.68)_32%,rgba(5,8,10,.18)_67%,rgba(5,8,10,.28)_100%)]" />
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,13,.24)_0%,rgba(7,11,13,0)_38%,#080c0f_100%)]" />

                                <div className="relative z-10 mx-auto flex min-h-[530px] w-full max-w-[1480px] items-end px-5 pb-24 pt-36 sm:min-h-[610px] sm:px-8 sm:pb-28 lg:min-h-[670px] lg:px-10 lg:pb-32">
                                    <div className="w-full max-w-[650px]">
                                        <div className="flex h-[68px] items-end sm:h-[52px]">
                                            <AnimeBadges anime={anime} />
                                        </div>

                                        <div className="mt-3 h-[74px] overflow-hidden sm:h-[104px] lg:h-[124px]">
                                            <h1 className="line-clamp-2 text-[34px] font-semibold leading-[1.06] tracking-[-0.02em] text-white drop-shadow-lg sm:text-[48px] lg:text-[58px]">
                                                {anime.title}
                                            </h1>
                                        </div>

                                        <div className="mt-2 h-5 overflow-hidden sm:h-6">
                                            {secondaryTitle && (
                                                <p className="truncate text-[14px] text-white/45 sm:text-[15px]">
                                                    {secondaryTitle}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-3 h-[60px] overflow-hidden sm:h-[72px]">
                                            <p className="line-clamp-3 max-w-[610px] text-[14px] leading-5 text-white/62 sm:text-[15px] sm:leading-6">
                                                {compactDescription(anime.description, 320)}
                                            </p>
                                        </div>

                                        <Link
                                            href={`/anime/${anime.slug}`}
                                            className="mt-5 inline-flex h-10 items-center rounded-xl bg-(--primary) px-5 text-[14px] font-medium shadow-[0_12px_30px_rgba(228,95,58,.18)] transition hover:bg-(--primary-3) sm:h-11 sm:px-6"
                                        >
                                            Дивитися
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>

            {items.length > 1 && (
                <div className="pointer-events-none absolute inset-x-0 bottom-[76px] z-20 sm:bottom-[94px]">
                    <div className="mx-auto flex w-full max-w-[1480px] justify-end gap-2 px-5 sm:px-8 lg:px-10">
                        <button
                            type="button"
                            onClick={() => swiper?.slidePrev()}
                            className="pointer-events-auto grid size-9 cursor-pointer place-items-center rounded-full border border-white/10 bg-black/30 text-white/65 backdrop-blur-md transition hover:bg-black/55 hover:text-white"
                            aria-label="Попередній слайд"
                        >
                            <ChevronLeft size={19} />
                        </button>
                        <button
                            type="button"
                            onClick={() => swiper?.slideNext()}
                            className="pointer-events-auto grid size-9 cursor-pointer place-items-center rounded-full border border-white/10 bg-black/30 text-white/65 backdrop-blur-md transition hover:bg-black/55 hover:text-white"
                            aria-label="Наступний слайд"
                        >
                            <ChevronRight size={19} />
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
