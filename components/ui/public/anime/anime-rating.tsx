"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";

import { useAppSelector } from "@/lib/hooks/redux";
import {
    useGetMyPublicAnimeReviewQuery,
    useRatePublicAnimeMutation,
} from "@/lib/store/animi/public-endpoints";
import cn from "@/lib/utils/cn";

export default function AnimeRating({
    slug,
    average,
    reviewsCount,
}: {
    slug: string;
    average: number | null | undefined;
    reviewsCount: number;
}) {
    const user = useAppSelector((state) => state.auth.user);
    const { data } = useGetMyPublicAnimeReviewQuery(slug, { skip: !user });
    const [rate, rateState] = useRatePublicAnimeMutation();
    const [hovered, setHovered] = useState<number | null>(null);
    const [selected, setSelected] = useState<number | null>(null);
    const [stats, setStats] = useState({ average: average ?? null, reviewsCount });

    useEffect(() => setSelected(data?.rating ?? null), [data?.rating]);

    async function handleRate(value: number) {
        if (!user || rateState.isLoading) return;
        setSelected(value);
        try {
            const result = await rate({ slug, rating: value }).unwrap();
            setStats({
                average: result.averageReviewRating,
                reviewsCount: result.reviewsCount,
            });
        } catch {
            setSelected(data?.rating ?? null);
        }
    }

    const active = hovered ?? selected ?? 0;

    return (
        <div className="border-t border-white/[0.055] px-4 py-4 text-center">
            <p className="text-[12px] font-medium text-white/48">
                {user ? "Як вам це аніме?" : "Увійдіть, щоб оцінити аніме"}
            </p>
            <div className="mt-2 flex justify-center gap-1" onMouseLeave={() => setHovered(null)}>
                {[1, 2, 3, 4, 5].map((value) => (
                    <button
                        key={value}
                        type="button"
                        disabled={!user || rateState.isLoading}
                        onMouseEnter={() => user && setHovered(value)}
                        onClick={() => handleRate(value)}
                        className="cursor-pointer disabled:cursor-default"
                        aria-label={`Оцінити на ${value}`}
                    >
                        <Star
                            size={21}
                            className={cn(
                                "transition",
                                value <= active
                                    ? "fill-(--primary) text-(--primary)"
                                    : "text-white/24",
                            )}
                        />
                    </button>
                ))}
            </div>
            <p className="mt-2 text-[11px] text-white/30">
                {stats.average ? `${stats.average.toFixed(1)} / 5` : "Ще немає оцінок"}
                {stats.reviewsCount > 0 && ` · ${stats.reviewsCount} оцінок`}
            </p>
        </div>
    );
}
