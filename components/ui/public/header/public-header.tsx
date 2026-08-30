"use client";

import Image from "next/image";
import Link from "next/link";
import {
    Bookmark,
    Dices,
    Film,
    House,
    LoaderCircle,
    LogOut,
    PlayCircle,
    Search,
    Shield,
    UserRound,
    X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import PublicAuthModal from "@/components/ui/public/auth/public-auth-modal";
import AnimeBadges from "@/components/ui/public/shared/anime-badges";
import PublicLogo from "@/components/ui/public/shared/public-logo";
import { UserRole } from "@/lib/constants/permissions";
import { useAppSelector } from "@/lib/hooks/redux";
import { useLazyLogoutQuery } from "@/lib/store/animi/auth-enpoints";
import { useLazyGetRandomAnimeQuery, useLazySearchPublicQuery } from "@/lib/store/animi/public-endpoints";
import type { PrivateUser } from "@/lib/types/entites/user";
import type { PublicSearchAnimeItem, PublicSearchUserItem } from "@/lib/types/public";
import cn from "@/lib/utils/cn";
import { imageSrc } from "@/lib/utils/public-anime";

export default function PublicHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const user = useAppSelector((state) => state.auth.user);
    const [query, setQuery] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchedQuery, setSearchedQuery] = useState("");
    const [authOpen, setAuthOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
    const [search, searchState] = useLazySearchPublicQuery();
    const [getRandom, randomState] = useLazyGetRandomAnimeQuery();
    const [logout, logoutState] = useLazyLogoutQuery();
    const searchAreaRef = useRef<HTMLDivElement>(null);
    const userAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const normalized = query.trim();
        if (!normalized || normalized === "@") {
            setSearchedQuery("");
            return;
        }

        const timeout = window.setTimeout(async () => {
            setSearchedQuery(normalized);
            await search({ query: normalized, limit: 5 });
        }, 260);

        return () => window.clearTimeout(timeout);
    }, [query, search]);

    useEffect(() => {
        const onPointerDown = (event: PointerEvent) => {
            if (!window.matchMedia("(min-width: 768px)").matches) return;
            const target = event.target as Node;
            if (!userAreaRef.current?.contains(target)) setUserOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, []);

    useEffect(() => {
        setMobileSearchOpen(false);
        setMobileCatalogOpen(false);
        setUserOpen(false);
    }, [pathname]);

    const normalizedQuery = query.trim();
    const hasSearchQuery = normalizedQuery.length > 0 && normalizedQuery !== "@";
    const searchPending =
        hasSearchQuery && (searchedQuery !== normalizedQuery || searchState.isFetching);
    const showDesktopSearch = searchFocused && hasSearchQuery;
    const showMobileSearchResults = mobileSearchOpen && hasSearchQuery;

    const closeMobilePanels = () => {
        setMobileSearchOpen(false);
        setMobileCatalogOpen(false);
        setUserOpen(false);
    };

    async function openRandom() {
        try {
            const anime = await getRandom().unwrap();
            closeMobilePanels();
            router.push(`/anime/${anime.slug}`);
        } catch {
            // Keep the current page if there is no public anime yet.
        }
    }

    async function handleLogout() {
        try {
            await logout().unwrap();
            setUserOpen(false);
            router.refresh();
        } catch {
            // Keep the menu open so the user can retry.
        }
    }

    function toggleMobileSearch() {
        setMobileCatalogOpen(false);
        setUserOpen(false);
        setMobileSearchOpen((value) => !value);
    }

    function toggleMobileCatalog() {
        setMobileSearchOpen(false);
        setUserOpen(false);
        setMobileCatalogOpen((value) => !value);
    }

    function toggleUserMenu() {
        if (!user) {
            closeMobilePanels();
            setAuthOpen(true);
            return;
        }

        setMobileSearchOpen(false);
        setMobileCatalogOpen(false);
        setUserOpen((value) => !value);
    }

    const mobilePanelOpen = mobileSearchOpen || mobileCatalogOpen || Boolean(user && userOpen);

    return (
        <>
            <header className="pointer-events-none fixed inset-x-0 top-0 z-[70] hidden px-5 pt-4 md:block lg:px-8 lg:pt-5">
                <div className="pointer-events-auto mx-auto grid min-h-[62px] w-full max-w-[1480px] grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-white/[0.045] bg-[#10161b]/95 px-5 shadow-[0_16px_60px_rgba(0,0,0,.26)] backdrop-blur-xl lg:grid-cols-[minmax(260px,1fr)_minmax(280px,620px)_minmax(260px,1fr)] lg:gap-6">
                    <PublicLogo />

                    <div
                        ref={searchAreaRef}
                        className="relative min-w-0"
                        onFocusCapture={() => setSearchFocused(true)}
                        onBlurCapture={(event) => {
                            const next = event.relatedTarget as Node | null;
                            if (!next || !searchAreaRef.current?.contains(next)) setSearchFocused(false);
                        }}
                    >
                        <SearchInput query={query} onChange={setQuery} />

                        {showDesktopSearch && (
                            <SearchPopover
                                query={normalizedQuery}
                                loading={searchPending}
                                result={searchState.data}
                                onNavigate={() => setSearchFocused(false)}
                            />
                        )}
                    </div>

                    <nav className="flex items-center justify-end gap-2" aria-label="Основна навігація">
                        <button
                            type="button"
                            onClick={openRandom}
                            disabled={randomState.isFetching}
                            title="Випадкове аніме"
                            className="grid size-10 cursor-pointer place-items-center rounded-xl text-white/85 transition hover:bg-white/[0.06] disabled:opacity-50"
                        >
                            <Dices size={21} strokeWidth={1.7} className={cn(randomState.isFetching && "animate-pulse")} />
                        </button>
                        <Link
                            href="/animes"
                            className="hidden rounded-lg px-2 py-2 text-[14px] font-medium uppercase text-white/78 transition hover:bg-white/[0.05] hover:text-white lg:block"
                        >
                            Усі аніме
                        </Link>
                        <Link
                            href="/animes?preset=ongoing"
                            className="hidden rounded-lg px-2 py-2 text-[14px] font-medium uppercase text-white/78 transition hover:bg-white/[0.05] hover:text-white lg:block"
                        >
                            Онгоїнги
                        </Link>

                        <div ref={userAreaRef} className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!user) {
                                        setAuthOpen(true);
                                        return;
                                    }
                                    setUserOpen((value) => !value);
                                }}
                                className={cn(
                                    "grid size-10 cursor-pointer place-items-center overflow-hidden rounded-xl border transition",
                                    user
                                        ? "border-white/[0.06] bg-white/[0.035] hover:bg-white/[0.07]"
                                        : "border-dashed border-white/15 bg-transparent text-white/65 hover:border-white/25 hover:text-white",
                                )}
                                aria-label={user ? "Меню користувача" : "Увійти"}
                            >
                                <UserAvatar user={user} size={40} />
                            </button>

                            {user && userOpen && (
                                <UserMenu
                                    user={user}
                                    loggingOut={logoutState.isFetching}
                                    onLogout={handleLogout}
                                />
                            )}
                        </div>
                    </nav>
                </div>
            </header>

            {mobilePanelOpen && (
                <button
                    type="button"
                    aria-label="Закрити меню"
                    onClick={closeMobilePanels}
                    className="fixed inset-0 z-[61] touch-none bg-black/[0.42] backdrop-blur-[2px] md:hidden"
                />
            )}

            {mobileSearchOpen && (
                <div className="fixed inset-x-3 bottom-[calc(86px+env(safe-area-inset-bottom))] z-[95] md:hidden">
                    <div className="mx-auto flex h-[min(520px,calc(100dvh-118px))] w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#10161b]/98 p-3 shadow-[0_28px_80px_rgba(0,0,0,.55)] backdrop-blur-2xl">
                        <div className="flex shrink-0 items-center justify-between px-1 pb-2.5">
                            <div>
                                <p className="text-[15px] font-medium text-white/90">Пошук</p>
                                <p className="mt-0.5 text-[12px] text-white/35">@ім’я — пошук користувачів</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMobileSearchOpen(false)}
                                className="grid size-9 place-items-center rounded-xl bg-white/[0.045] text-white/55 transition active:scale-95"
                                aria-label="Закрити пошук"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="shrink-0">
                            <SearchInput query={query} onChange={setQuery} autoFocus />
                        </div>

                        <div className="mt-3 min-h-0 flex-1">
                            {!normalizedQuery && (
                                <div className="flex h-full items-center justify-center rounded-2xl border border-white/[0.045] bg-white/[0.018] px-6 text-center">
                                    <div>
                                        <Search size={25} className="mx-auto mb-3 text-white/18" />
                                        <p className="text-[14px] text-white/48">Почніть вводити назву аніме</p>
                                        <p className="mt-1 text-[12px] leading-relaxed text-white/25">
                                            Або використайте @ перед ім’ям користувача
                                        </p>
                                    </div>
                                </div>
                            )}

                            {normalizedQuery === "@" && (
                                <div className="flex h-full items-center justify-center rounded-2xl border border-white/[0.045] bg-white/[0.018] px-6 text-center text-[13px] text-white/38">
                                    Введіть ім’я користувача після @
                                </div>
                            )}

                            {showMobileSearchResults && (
                                <SearchPopover
                                    embedded
                                    query={normalizedQuery}
                                    loading={searchPending}
                                    result={searchState.data}
                                    onNavigate={() => setMobileSearchOpen(false)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {mobileCatalogOpen && (
                <div className="fixed inset-x-3 bottom-[calc(86px+env(safe-area-inset-bottom))] z-[95] md:hidden">
                    <div className="mx-auto w-full max-w-[430px] overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#10161b]/98 p-2 shadow-[0_28px_80px_rgba(0,0,0,.55)] backdrop-blur-2xl">
                        <Link
                            href="/animes"
                            onClick={closeMobilePanels}
                            className="flex items-center gap-3 rounded-[18px] px-3 py-3.5 transition active:bg-white/[0.05]"
                        >
                            <span className="grid size-10 place-items-center rounded-xl bg-white/[0.045] text-white/65">
                                <Film size={20} />
                            </span>
                            <span>
                                <span className="block text-[14px] text-white/88">Усі аніме</span>
                                <span className="mt-0.5 block text-[12px] text-white/34">Переглянути весь каталог</span>
                            </span>
                        </Link>
                        <Link
                            href="/animes?preset=ongoing"
                            onClick={closeMobilePanels}
                            className="flex items-center gap-3 rounded-[18px] px-3 py-3.5 transition active:bg-white/[0.05]"
                        >
                            <span className="grid size-10 place-items-center rounded-xl bg-[#e45f3a]/10 text-(--primary)">
                                <PlayCircle size={20} />
                            </span>
                            <span>
                                <span className="block text-[14px] text-white/88">Онгоїнги</span>
                                <span className="mt-0.5 block text-[12px] text-white/34">Аніме, що виходять зараз</span>
                            </span>
                        </Link>
                    </div>
                </div>
            )}

            {user && userOpen && (
                <MobileUserMenu
                    user={user}
                    loggingOut={logoutState.isFetching}
                    onLogout={handleLogout}
                    onNavigate={closeMobilePanels}
                />
            )}

            <nav
                className="fixed inset-x-0 bottom-0 z-[80] px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 md:hidden"
                aria-label="Мобільна навігація"
            >
                <div className="mx-auto grid h-[68px] w-full max-w-[560px] grid-cols-5 items-center rounded-[24px] border border-white/[0.075] bg-[#10161b]/94 px-1.5 shadow-[0_-8px_40px_rgba(0,0,0,.22),0_18px_55px_rgba(0,0,0,.48)] backdrop-blur-2xl">
                    <MobileNavLink href="/" label="Головна" active={pathname === "/"} icon={<House size={20} />} />
                    <MobileNavButton
                        label="Пошук"
                        active={mobileSearchOpen || pathname.startsWith("/search")}
                        onClick={toggleMobileSearch}
                        icon={<Search size={20} />}
                    />

                    <div className="flex h-full items-center justify-center">
                        <button
                            type="button"
                            onClick={toggleUserMenu}
                            className={cn(
                                "group relative -mt-5 grid size-[54px] place-items-center overflow-hidden rounded-[19px] border text-white transition active:scale-95",
                                user
                                    ? "border-white/12 bg-[#1b2228] shadow-[0_12px_28px_rgba(0,0,0,.36)]"
                                    : "border-white/10 bg-(--primary) shadow-[0_12px_28px_rgba(228,95,58,.34)]",
                                user && userOpen && "ring-2 ring-[#e45f3a]/45 ring-offset-2 ring-offset-[#10161b]",
                            )}
                            aria-label={user ? "Профіль" : "Увійти"}
                        >
                            <UserAvatar user={user} size={54} />
                        </button>
                    </div>

                    <MobileNavButton
                        label="Аніме"
                        active={mobileCatalogOpen || pathname.startsWith("/animes")}
                        onClick={toggleMobileCatalog}
                        icon={<Film size={20} />}
                    />
                    <MobileNavButton
                        label="Рандом"
                        active={false}
                        onClick={openRandom}
                        disabled={randomState.isFetching}
                        icon={
                            <Dices
                                size={20}
                                className={cn(randomState.isFetching && "animate-pulse")}
                            />
                        }
                    />
                </div>
            </nav>

            <PublicAuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
        </>
    );
}

function SearchInput({
    query,
    onChange,
    autoFocus = false,
}: {
    query: string;
    onChange: (value: string) => void;
    autoFocus?: boolean;
}) {
    return (
        <div className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.035] bg-[#171d22] px-3 transition focus-within:border-white/10 focus-within:bg-[#1a2025]">
            <Search size={19} className="shrink-0 text-white/70" strokeWidth={1.8} />
            <input
                value={query}
                onChange={(event) => onChange(event.target.value)}
                autoFocus={autoFocus}
                placeholder="Пошук аніме"
                aria-label="Пошук аніме або користувачів"
                className="min-w-0 flex-1 bg-transparent text-[15px] text-white/85 outline-none placeholder:text-white/32"
            />
            {query && (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    className="grid size-7 cursor-pointer place-items-center rounded-md text-white/35 transition hover:bg-white/6 hover:text-white/70"
                    aria-label="Очистити пошук"
                >
                    <X size={15} />
                </button>
            )}
        </div>
    );
}

function SearchPopover({
    query,
    loading,
    result,
    onNavigate,
    embedded = false,
}: {
    query: string;
    loading: boolean;
    result: ReturnType<typeof useLazySearchPublicQuery>[1]["data"];
    onNavigate: () => void;
    embedded?: boolean;
}) {
    const items = result?.items ?? [];
    const isUserSearch = result?.type === "user" || query.startsWith("@");

    return (
        <div
            className={cn(
                "flex overflow-hidden rounded-2xl border border-white/[0.06] bg-[#11171c] p-2 shadow-[0_24px_70px_rgba(0,0,0,.48)]",
                embedded
                    ? "h-full flex-col shadow-none"
                    : "absolute left-0 right-0 top-[calc(100%+10px)] h-[548px] flex-col",
            )}
        >
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {loading ? (
                    <div className="flex h-full min-h-[180px] items-center justify-center px-3 text-center">
                        <div>
                            <LoaderCircle size={24} className="mx-auto animate-spin text-(--primary)" />
                            <p className="mt-3 text-sm text-white/42">Завантаження…</p>
                        </div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex h-full min-h-[180px] items-center justify-center px-3 text-center">
                        <div>
                            <p className="text-sm text-white/62">Нічого не знайдено</p>
                            <p className="mt-1 text-[13px] text-white/28">
                                {isUserSearch ? "Спробуйте інше ім’я користувача." : "Перевірте назву або спробуйте інший запит."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {result?.type === "user"
                            ? result.items.map((item) => (
                                  <UserSearchItem key={item.id} item={item} onNavigate={onNavigate} />
                              ))
                            : result?.items.map((item) => (
                                  <AnimeSearchItem key={item.id} item={item} onNavigate={onNavigate} />
                              ))}
                    </div>
                )}
            </div>

            <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={onNavigate}
                className="mt-2 flex h-10 shrink-0 items-center justify-center rounded-xl bg-(--primary) px-3 text-sm font-medium transition hover:bg-(--primary-3)"
            >
                Перейти до всіх результатів
            </Link>
        </div>
    );
}

function AnimeSearchItem({ item, onNavigate }: { item: PublicSearchAnimeItem; onNavigate: () => void }) {
    const poster = imageSrc(item.poster?.path);
    return (
        <Link
            href={`/anime/${item.slug}`}
            onClick={onNavigate}
            className="group grid min-h-[86px] grid-cols-[1fr_42%] overflow-hidden rounded-xl border border-white/[0.035] bg-[#080d10] transition hover:border-white/10 hover:bg-[#0b1115]"
        >
            <div className="min-w-0 p-3">
                <p className="line-clamp-2 text-[14px] leading-[1.15] text-white/88 group-hover:text-white">{item.title}</p>
                <div className="mt-2"><AnimeBadges anime={item} compact /></div>
            </div>
            <div className="relative min-h-[86px] overflow-hidden bg-white/[0.03]">
                {poster ? (
                    <Image src={poster} alt="" fill unoptimized sizes="250px" className="object-cover transition duration-300 group-hover:scale-[1.025]" />
                ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(228,95,58,.23),transparent_48%)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[#080d10] via-transparent to-transparent" />
            </div>
        </Link>
    );
}

function UserSearchItem({ item, onNavigate }: { item: PublicSearchUserItem; onNavigate: () => void }) {
    const avatar = imageSrc(item.avatar?.path);
    return (
        <Link
            href={`/users/${encodeURIComponent(item.username)}`}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl border border-white/[0.035] bg-[#0b1014] p-2.5 transition hover:border-white/10 hover:bg-white/[0.035]"
        >
            <div className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/[0.06] text-white/45">
                {avatar ? <Image src={avatar} alt="" fill unoptimized sizes="40px" className="object-cover" /> : <UserRound size={19} />}
            </div>
            <div className="min-w-0">
                <p className="truncate text-sm text-white/88">{item.displayName || item.username}</p>
                <p className="truncate text-[13px] text-white/35">@{item.username}</p>
            </div>
        </Link>
    );
}

function UserAvatar({ user, size }: { user: PrivateUser | null; size: number }) {
    if (user?.avatar?.path) {
        return (
            <Image
                src={imageSrc(user.avatar.path)!}
                alt={user.displayName || user.username}
                width={size}
                height={size}
                unoptimized
                className="size-full object-cover"
            />
        );
    }

    return <UserRound size={size <= 24 ? 20 : size >= 50 ? 27 : 22} strokeWidth={1.7} />;
}

function MobileNavLink({
    href,
    label,
    active,
    icon,
}: {
    href: string;
    label: string;
    active: boolean;
    icon: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className={cn(
                "flex h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-[17px] text-[11px] font-medium transition active:scale-95",
                active ? "text-white" : "text-white/42 active:bg-white/[0.045] active:text-white/75",
            )}
        >
            <span className={cn("transition", active && "text-(--primary)")}>{icon}</span>
            <span className="max-w-full truncate px-1">{label}</span>
        </Link>
    );
}

function MobileNavButton({
    label,
    active,
    onClick,
    icon,
    disabled = false,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-[17px] text-[11px] font-medium transition active:scale-95 disabled:opacity-55",
                active ? "text-white" : "text-white/42 active:bg-white/[0.045] active:text-white/75",
            )}
        >
            <span className={cn("grid size-5 place-items-center overflow-hidden rounded-full transition", active && "text-(--primary)")}>{icon}</span>
            <span className="max-w-full truncate px-1">{label}</span>
        </button>
    );
}

function UserMenu({
    user,
    loggingOut,
    onLogout,
}: {
    user: PrivateUser;
    loggingOut: boolean;
    onLogout: () => void;
}) {
    const canOpenAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
    return (
        <div className="absolute right-0 top-[calc(100%+18px)] w-[250px] overflow-hidden rounded-2xl border border-white/[0.055] bg-[#11171c] shadow-[0_24px_70px_rgba(0,0,0,.48)]">
            <UserMenuHeader user={user} loggingOut={loggingOut} onLogout={onLogout} />
            <UserMenuLinks user={user} canOpenAdmin={canOpenAdmin} />
        </div>
    );
}

function MobileUserMenu({
    user,
    loggingOut,
    onLogout,
    onNavigate,
}: {
    user: PrivateUser;
    loggingOut: boolean;
    onLogout: () => void;
    onNavigate: () => void;
}) {
    const canOpenAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
    return (
        <div className="fixed inset-x-3 bottom-[calc(86px+env(safe-area-inset-bottom))] z-[95] md:hidden">
            <div className="mx-auto w-full max-w-[430px] overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#10161b]/98 shadow-[0_28px_80px_rgba(0,0,0,.55)] backdrop-blur-2xl">
                <UserMenuHeader user={user} loggingOut={loggingOut} onLogout={onLogout} mobile />
                <UserMenuLinks user={user} canOpenAdmin={canOpenAdmin} mobile onNavigate={onNavigate} />
            </div>
        </div>
    );
}

function UserMenuHeader({
    user,
    loggingOut,
    onLogout,
    mobile = false,
}: {
    user: PrivateUser;
    loggingOut: boolean;
    onLogout: () => void;
    mobile?: boolean;
}) {
    return (
        <div className={cn("flex items-center justify-between gap-3 border-b border-white/[0.055]", mobile ? "px-4 py-4" : "px-4 py-4")}>
            <div className="flex min-w-0 items-center gap-3">
                {mobile && (
                    <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-white/[0.05] text-white/50">
                        <UserAvatar user={user} size={44} />
                    </div>
                )}
                <div className="min-w-0">
                    <p className="truncate text-[15px] text-white/90">{user.displayName || user.username}</p>
                    <p className="truncate text-[13px] text-white/35">@{user.username}</p>
                </div>
            </div>
            <button
                type="button"
                disabled={loggingOut}
                onClick={onLogout}
                title="Вийти"
                className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg bg-white/[0.05] text-white/45 transition hover:bg-white/[0.09] hover:text-white disabled:opacity-40"
            >
                <LogOut size={18} />
            </button>
        </div>
    );
}

function UserMenuLinks({
    user,
    canOpenAdmin,
    mobile = false,
    onNavigate,
}: {
    user: PrivateUser;
    canOpenAdmin: boolean;
    mobile?: boolean;
    onNavigate?: () => void;
}) {
    return (
        <div className={cn("space-y-0.5 text-[14px] text-white/45", mobile ? "p-2.5" : "p-2")}>
            <MenuLink href={`/users/${encodeURIComponent(user.username)}`} icon={<UserRound size={17} />} onNavigate={onNavigate}>Профіль</MenuLink>
            <MenuLink href="/continue" icon={<PlayCircle size={17} />} onNavigate={onNavigate}>Продовжити дивитись</MenuLink>
            <MenuLink href="/bookmarks" icon={<Bookmark size={17} />} onNavigate={onNavigate}>Додане</MenuLink>
            {canOpenAdmin && <MenuLink href="/admin" icon={<Shield size={17} />} onNavigate={onNavigate}>Адмінпанель</MenuLink>}
        </div>
    );
}

function MenuLink({
    href,
    icon,
    children,
    onNavigate,
}: {
    href: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    onNavigate?: () => void;
}) {
    return (
        <Link href={href} onClick={onNavigate} className="flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 transition hover:bg-white/[0.045] hover:text-white/75 active:bg-white/[0.05]">
            {icon}
            {children}
        </Link>
    );
}
