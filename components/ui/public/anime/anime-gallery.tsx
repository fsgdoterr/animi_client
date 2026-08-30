"use client";

import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";

import type { PublicAnimeDetails } from "@/lib/types/public";
import { imageSrc } from "@/lib/utils/public-anime";

export default function AnimeGallery({
    title,
    images,
}: {
    title: string;
    images: PublicAnimeDetails["additionalImages"];
}) {
    const items = useMemo(
        () => [...new Map(images.map((image) => [image.path, image])).values()],
        [images],
    );
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    useEffect(() => {
        if (activeIndex === null) return;

        const previousOverflow = document.body.style.overflow;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setActiveIndex(null);
            if (event.key === "ArrowLeft") {
                setActiveIndex((index) =>
                    index === null ? null : (index - 1 + items.length) % items.length,
                );
            }
            if (event.key === "ArrowRight") {
                setActiveIndex((index) =>
                    index === null ? null : (index + 1) % items.length,
                );
            }
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [activeIndex, items.length]);

    if (!items.length) return null;

    const lightbox =
        activeIndex !== null
            ? createPortal(
                  <div className="fixed inset-0 z-[160] grid place-items-center bg-black/88 p-3 backdrop-blur-md sm:p-8">
                      <button
                          type="button"
                          className="absolute inset-0 cursor-zoom-out"
                          onClick={() => setActiveIndex(null)}
                          aria-label="Закрити галерею"
                      />

                      <div className="pointer-events-none relative z-10 flex size-full max-h-[900px] max-w-[1440px] items-center justify-center">
                          <div className="relative h-full w-full">
                              {imageSrc(items[activeIndex]?.path) && (
                                  <Image
                                      src={imageSrc(items[activeIndex]?.path)!}
                                      alt={`${title} — кадр ${activeIndex + 1}`}
                                      fill
                                      unoptimized
                                      sizes="100vw"
                                      className="object-contain"
                                  />
                              )}
                          </div>
                      </div>

                      <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-center justify-between sm:inset-x-6 sm:top-6">
                          <span className="rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-[12px] text-white/62 backdrop-blur-md">
                              {activeIndex + 1} / {items.length}
                          </span>
                          <button
                              type="button"
                              onClick={() => setActiveIndex(null)}
                              className="pointer-events-auto grid size-10 place-items-center rounded-full border border-white/10 bg-black/45 text-white/68 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
                              aria-label="Закрити галерею"
                          >
                              <X size={19} />
                          </button>
                      </div>

                      {items.length > 1 && (
                          <>
                              <button
                                  type="button"
                                  onClick={() =>
                                      setActiveIndex((index) =>
                                          index === null ? null : (index - 1 + items.length) % items.length,
                                      )
                                  }
                                  className="absolute left-3 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/45 text-white/65 backdrop-blur-md transition hover:bg-white/10 hover:text-white sm:left-6"
                                  aria-label="Попередній кадр"
                              >
                                  <ChevronLeft size={22} />
                              </button>
                              <button
                                  type="button"
                                  onClick={() =>
                                      setActiveIndex((index) =>
                                          index === null ? null : (index + 1) % items.length,
                                      )
                                  }
                                  className="absolute right-3 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/45 text-white/65 backdrop-blur-md transition hover:bg-white/10 hover:text-white sm:right-6"
                                  aria-label="Наступний кадр"
                              >
                                  <ChevronRight size={22} />
                              </button>
                          </>
                      )}
                  </div>,
                  document.body,
              )
            : null;

    return (
        <>
            <section className="overflow-hidden rounded-2xl border border-white/[0.055] bg-[#10161b]/96 p-3.5 sm:p-4">
                <div className="mb-3 flex items-center gap-2">
                    <Images size={16} className="text-white/36" />
                    <h2 className="text-[15px] font-medium text-white/78 sm:text-[16px]">Кадри</h2>
                    <span className="ml-auto text-[11px] text-white/28">{items.length}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                    {items.slice(0, 8).map((image, index) => {
                        const src = imageSrc(image.path);
                        if (!src) return null;

                        return (
                            <button
                                key={image.id}
                                type="button"
                                onClick={() => setActiveIndex(index)}
                                className="group relative aspect-video overflow-hidden rounded-xl border border-white/[0.05] bg-[#161d22] text-left"
                                aria-label={`Відкрити кадр ${index + 1}`}
                            >
                                <Image
                                    src={src}
                                    alt={`${title} — кадр ${index + 1}`}
                                    fill
                                    unoptimized
                                    sizes="(max-width: 640px) 45vw, 260px"
                                    className="object-cover transition duration-500 group-hover:scale-[1.035]"
                                />
                                <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/0" />
                                {index === 7 && items.length > 8 && (
                                    <div className="absolute inset-0 grid place-items-center bg-black/58 backdrop-blur-[1px]">
                                        <span className="text-[14px] font-medium text-white/88">+{items.length - 8}</span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>
            {lightbox}
        </>
    );
}
