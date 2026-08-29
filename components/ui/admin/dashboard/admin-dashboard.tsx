"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
    ArrowRight,
    Clapperboard,
    Eye,
    FileWarning,
    Hash,
    MessageSquare,
    PlayCircle,
    Star,
    UserPlus,
    Users,
} from "lucide-react";

import ErrorAlert from "@/components/ui/admin/shared/error-alert";
import { useGetDashboardStatsQuery } from "@/lib/store/animi/admin-stats-endpoints";
import type { AnimeStatus } from "@/lib/types/entites/anime";
import { formatDate } from "@/lib/utils/format-date";

const statusLabel: Record<AnimeStatus, string> = {
    DRAFT: "Чернетки",
    ANNOUNCED: "Анонсовані",
    ONGOING: "Онґоінги",
    COMPLETED: "Завершені",
    CANCELED: "Скасовані",
};

export default function AdminDashboard() {
    const { data, isLoading, error } = useGetDashboardStatsQuery();

    if (isLoading) return <DashboardSkeleton />;

    if (error || !data) {
        return (
            <div className="flex min-h-full flex-col">
                <DashboardHeader />
                <ErrorAlert error={error ?? "Не вдалося завантажити статистику."} />
            </div>
        );
    }

    const maxActivity = Math.max(...data.activity.map((item) => item.views), 1);
    const totalStatus = Math.max(
        Object.values(data.status).reduce((sum, value) => sum + value, 0),
        1,
    );

    return (
        <div className="flex min-h-full min-w-0 flex-col pb-1">
            <DashboardHeader />

            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                    title="Перегляди"
                    value={data.overview.views}
                    detail={`${formatNumber(data.recent.views7)} за 7 днів · ${formatNumber(data.recent.views30)} за 30`}
                    href="/admin/animes?sort=views"
                    linkLabel="Популярність аніме"
                    icon={Eye}
                />
                <KpiCard
                    title="Користувачі"
                    value={data.overview.users}
                    detail={`+${formatNumber(data.recent.newUsers7)} за 7 днів · +${formatNumber(data.recent.newUsers30)} за 30`}
                    href="/admin/users"
                    linkLabel="Усі користувачі"
                    icon={Users}
                />
                <KpiCard
                    title="Аніме"
                    value={data.overview.anime}
                    detail={`+${formatNumber(data.recent.newAnime7)} за 7 днів · ${formatNumber(data.overview.episodes)} серій`}
                    href="/admin/animes"
                    linkLabel="Каталог аніме"
                    icon={Clapperboard}
                />
                <KpiCard
                    title="Оцінки"
                    value={data.overview.reviews}
                    detail={`${formatRating(data.engagement.averageRating)} середня · +${formatNumber(data.recent.reviews30)} за 30 днів`}
                    href="/admin/animes"
                    linkLabel="До аніме"
                    icon={Star}
                />
            </div>

            <div className="mt-3 grid min-h-0 gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.85fr)]">
                <section className="rounded-xl border border-white/[0.025] bg-[#11171c] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.12)] sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-[17px] font-medium text-white/88">Активність за 14 днів</h2>
                            <p className="mt-1 text-[13px] text-white/32">
                                Перегляди та нові реєстрації по днях.
                            </p>
                        </div>
                        <div className="hidden items-center gap-4 text-[12px] text-white/34 sm:flex">
                            <span>Перегляди</span>
                            <span>Нові користувачі</span>
                        </div>
                    </div>

                    <div className="mt-6 flex h-[220px] items-end gap-1.5 sm:gap-2">
                        {data.activity.map((item) => {
                            const height = item.views === 0 ? 0 : Math.max(5, (item.views / maxActivity) * 100);
                            const usersHeight = item.users === 0 ? 0 : Math.max(3, Math.min(30, item.users * 5));
                            return (
                                <div key={item.date} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                                    <div className="relative flex h-[178px] w-full items-end justify-center gap-[2px] rounded-md bg-white/[0.018] px-[2px]">
                                        <div
                                            className="w-[56%] rounded-t bg-white/[0.18] transition group-hover:bg-white/[0.28]"
                                            style={{ height: `${height}%` }}
                                            title={`${item.views.toLocaleString("uk-UA")} переглядів`}
                                        />
                                        <div
                                            className="w-[24%] rounded-t bg-emerald-300/45 transition group-hover:bg-emerald-300/65"
                                            style={{ height: `${usersHeight}%` }}
                                            title={`${item.users.toLocaleString("uk-UA")} нових користувачів`}
                                        />
                                    </div>
                                    <span className="hidden text-[10px] text-white/23 sm:block">
                                        {new Date(`${item.date}T00:00:00Z`).toLocaleDateString("uk-UA", {
                                            day: "2-digit",
                                            month: "2-digit",
                                        })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="rounded-xl border border-white/[0.025] bg-[#11171c] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.12)] sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-[17px] font-medium text-white/88">Стан каталогу</h2>
                            <p className="mt-1 text-[13px] text-white/32">Що потребує уваги редактора.</p>
                        </div>
                        <FileWarning size={19} className="text-white/26" />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                        <HealthMetric label="Без постера" value={data.contentHealth.missingPoster} href="/admin/animes?issue=missingPoster" />
                        <HealthMetric label="Без опису" value={data.contentHealth.missingDescription} href="/admin/animes?issue=missingDescription" />
                        <HealthMetric label="Без серій" value={data.contentHealth.withoutEpisodes} href="/admin/animes?issue=withoutEpisodes" />
                        <HealthMetric
                            label="Серії без активного варіанта"
                            value={data.contentHealth.episodesWithoutActiveVariant}
                            href="/admin/animes?issue=withoutActiveVariant"
                        />
                    </div>

                    <div className="mt-5 border-t border-white/[0.05] pt-4">
                        <p className="mb-3 text-[12px] uppercase tracking-[0.08em] text-white/24">Статуси аніме</p>
                        <div className="grid gap-2.5">
                            {(Object.entries(data.status) as [AnimeStatus, number][]).map(([status, value]) => (
                                <Link
                                    key={status}
                                    href={`/admin/animes?status=${status}`}
                                    className="group/status block rounded-md px-1 py-0.5 transition hover:bg-white/[0.025]"
                                >
                                    <div className="mb-1 flex justify-between gap-3 text-[12px]">
                                        <span className="text-white/42 transition group-hover/status:text-white/62">{statusLabel[status]}</span>
                                        <span className="text-white/60">{value.toLocaleString("uk-UA")}</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                                        <div
                                            className="h-full rounded-full bg-white/[0.18]"
                                            style={{ width: `${value === 0 ? 0 : Math.max(2, (value / totalStatus) * 100)}%` }}
                                        />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-2">
                <DashboardListCard title="Найпопулярніші аніме" href="/admin/animes?sort=views" linkLabel="Усі аніме">
                    {data.topAnime.length ? (
                        data.topAnime.map((anime, index) => (
                            <Link
                                key={anime.id}
                                href={`/admin/animes/${anime.id}`}
                                className="grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 border-t border-white/[0.045] py-3 first:border-0 first:pt-0 last:pb-0 hover:text-white"
                            >
                                <span className="text-[13px] text-white/22">{String(index + 1).padStart(2, "0")}</span>
                                <div className="min-w-0">
                                    <p className="truncate text-[14px] text-white/72">{anime.title}</p>
                                    <p className="mt-1 text-[12px] text-white/28">
                                        {anime.reviews} оцінок · {formatRating(anime.averageRating)} · {anime.subscriptions} підписок
                                    </p>
                                </div>
                                <span className="text-[13px] text-white/52">{formatNumber(anime.views)}</span>
                            </Link>
                        ))
                    ) : (
                        <EmptyText>Переглядів аніме ще немає.</EmptyText>
                    )}
                </DashboardListCard>

                <DashboardListCard title="Коди з найбільшим трафіком" href="/admin/codes?sort=views" linkLabel="Усі коди">
                    {data.topCodes.length ? (
                        data.topCodes.map((code) => (
                            <Link
                                key={code.id}
                                href={`/admin/codes/${code.id}`}
                                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-white/[0.045] py-3 first:border-0 first:pt-0 last:pb-0"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-mono text-[13px] tracking-[0.03em] text-white/72">{code.code}</p>
                                    <p className="mt-1 truncate text-[12px] text-white/28">{code.anime.title}</p>
                                </div>
                                <span className="text-[13px] text-white/52">{formatNumber(code.views)}</span>
                            </Link>
                        ))
                    ) : (
                        <EmptyText>За кодами ще немає переглядів.</EmptyText>
                    )}
                </DashboardListCard>
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-2">
                <DashboardListCard title="Нові користувачі" href="/admin/users" linkLabel="Користувачі">
                    {data.recentUsers.map((user) => (
                        <Link
                            key={user.id}
                            href={`/admin/users/${user.id}`}
                            className="flex items-center justify-between gap-4 border-t border-white/[0.045] py-3 first:border-0 first:pt-0 last:pb-0"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-[14px] text-white/70">{user.displayName || user.username}</p>
                                <p className="mt-1 truncate text-[12px] text-white/27">@{user.username} · {user.role}</p>
                            </div>
                            <span className="shrink-0 text-[12px] text-white/25">{formatDate(user.createdAt)}</span>
                        </Link>
                    ))}
                </DashboardListCard>

                <DashboardListCard title="Нещодавно додані аніме" href="/admin/animes" linkLabel="Аніме">
                    {data.recentAnime.map((anime) => (
                        <Link
                            key={anime.id}
                            href={`/admin/animes/${anime.id}`}
                            className="flex items-center justify-between gap-4 border-t border-white/[0.045] py-3 first:border-0 first:pt-0 last:pb-0"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-[14px] text-white/70">{anime.title}</p>
                                <p className="mt-1 text-[12px] text-white/27">{statusLabel[anime.status]}</p>
                            </div>
                            <span className="shrink-0 text-[12px] text-white/25">{formatDate(anime.createdAt)}</span>
                        </Link>
                    ))}
                </DashboardListCard>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MiniMetric icon={MessageSquare} label="Коментарі" value={data.overview.comments} />
                <MiniMetric icon={PlayCircle} label="Активні варіанти" value={data.overview.activeVariants} />
                <MiniMetric icon={Hash} label="Коди" value={data.overview.codes} href="/admin/codes" />
                <MiniMetric icon={UserPlus} label="Підписки" value={data.overview.subscriptions} detail={`+${data.recent.subscriptions30} за 30 днів`} />
            </div>
        </div>
    );
}

function DashboardHeader() {
    return (
        <header className="flex min-h-11 shrink-0 items-end justify-between gap-4 px-0.5">
            <div>
                <h1 className="text-[24px] leading-tight text-white/90 sm:text-[26px]">Дашборд</h1>
                <p className="mt-1 text-[13px] text-white/30">Ключові показники платформи та стан контенту.</p>
            </div>
        </header>
    );
}

function KpiCard({ title, value, detail, href, linkLabel, icon: Icon }: {
    title: string;
    value: number;
    detail: string;
    href: string;
    linkLabel: string;
    icon: typeof Eye;
}) {
    return (
        <section className="group rounded-xl border border-white/[0.025] bg-[#11171c] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.12)] sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[13px] text-white/35">{title}</p>
                    <p className="mt-2 text-[30px] leading-none tracking-[-0.025em] text-white/90">{formatNumber(value)}</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-white/[0.035] text-white/30 transition group-hover:bg-white/[0.055] group-hover:text-white/44">
                    <Icon size={19} strokeWidth={1.8} />
                </div>
            </div>
            <p className="mt-3 min-h-5 text-[12px] text-white/28">{detail}</p>
            <Link href={href} className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-white/43 transition hover:text-white/72">
                {linkLabel}
                <ArrowRight size={13} />
            </Link>
        </section>
    );
}

function HealthMetric({ label, value, href }: { label: string; value: number; href: string }) {
    return (
        <Link href={href} className="rounded-lg bg-[#171d22] p-3 transition hover:bg-[#1a2127]">
            <p className="text-[22px] leading-none text-white/83">{value.toLocaleString("uk-UA")}</p>
            <p className="mt-2 text-[12px] leading-4 text-white/32">{label}</p>
        </Link>
    );
}

function DashboardListCard({ title, href, linkLabel, children }: { title: string; href: string; linkLabel: string; children: ReactNode }) {
    return (
        <section className="rounded-xl border border-white/[0.025] bg-[#11171c] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.12)] sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-[17px] font-medium text-white/86">{title}</h2>
                <Link href={href} className="inline-flex items-center gap-1 text-[12px] text-white/34 transition hover:text-white/65">
                    {linkLabel}<ArrowRight size={13} />
                </Link>
            </div>
            <div>{children}</div>
        </section>
    );
}

function MiniMetric({ icon: Icon, label, value, detail, href }: { icon: typeof Eye; label: string; value: number; detail?: string; href?: string }) {
    const content = (
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.025] bg-[#11171c] p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.035] text-white/28"><Icon size={17} /></div>
            <div className="min-w-0">
                <p className="text-[12px] text-white/31">{label}</p>
                <p className="mt-0.5 text-[18px] text-white/77">{formatNumber(value)}{detail && <span className="ml-2 text-[11px] text-white/25">{detail}</span>}</p>
            </div>
        </div>
    );
    return href ? <Link href={href}>{content}</Link> : content;
}

function EmptyText({ children }: { children: ReactNode }) {
    return <p className="py-6 text-center text-[13px] text-white/28">{children}</p>;
}

function DashboardSkeleton() {
    return (
        <div className="flex min-h-full flex-col">
            <DashboardHeader />
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[0, 1, 2, 3].map((item) => <div key={item} className="h-[156px] animate-pulse rounded-xl bg-[#11171c]" />)}
            </div>
            <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.85fr)]">
                <div className="h-[330px] animate-pulse rounded-xl bg-[#11171c]" />
                <div className="h-[330px] animate-pulse rounded-xl bg-[#11171c]" />
            </div>
        </div>
    );
}

function formatNumber(value: number) {
    return new Intl.NumberFormat("uk-UA", { notation: value >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

function formatRating(value: number | null) {
    return value == null ? "—" : value.toFixed(1);
}
