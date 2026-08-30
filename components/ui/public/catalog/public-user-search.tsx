"use client";

import Image from "next/image";
import Link from "next/link";
import { LoaderCircle, UserRound } from "lucide-react";
import { useEffect } from "react";

import { useLazySearchPublicQuery } from "@/lib/store/animi/public-endpoints";
import { imageSrc } from "@/lib/utils/public-anime";

export default function PublicUserSearch({ query }: { query: string }) {
    const [search, state] = useLazySearchPublicQuery();

    useEffect(() => {
        if (query.trim() && query.trim() !== "@") void search({ query, limit: 50 });
    }, [query, search]);

    const items = state.data?.type === "user" ? state.data.items : [];

    return (
        <div className="mx-auto min-h-[calc(100dvh-160px)] w-full max-w-[1000px] px-4 pb-20 pt-36 sm:px-6 sm:pt-32 lg:px-8">
            <p className="text-[13px] uppercase tracking-[0.18em] text-(--primary-3)">Пошук користувачів</p>
            <h1 className="mt-1 text-[30px] font-semibold tracking-tight text-white/92 sm:text-[38px]">{query}</h1>

            {state.isFetching && !state.data ? (
                <div className="flex min-h-[360px] items-center justify-center text-white/35">
                    <LoaderCircle size={20} className="mr-2 animate-spin" /> Пошук...
                </div>
            ) : items.length ? (
                <div className="mt-7 grid gap-2 sm:grid-cols-2">
                    {items.map((user) => {
                        const avatar = imageSrc(user.avatar?.path);
                        return (
                            <Link
                                key={user.id}
                                href={`/users/${encodeURIComponent(user.username)}`}
                                className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-[#11171c] p-3 transition hover:border-white/10 hover:bg-[#151b20]"
                            >
                                <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-white/[0.05] text-white/35">
                                    {avatar ? <Image src={avatar} alt="" fill unoptimized sizes="48px" className="object-cover" /> : <UserRound size={21} />}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-[15px] text-white/82">{user.displayName || user.username}</p>
                                    <p className="truncate text-[13px] text-white/32">@{user.username}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="mt-7 flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-white/[0.07] text-white/35">
                    Користувачів не знайдено
                </div>
            )}
        </div>
    );
}
