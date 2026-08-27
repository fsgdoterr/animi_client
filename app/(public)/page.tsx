import Link from "next/link";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/server";
import { backendUrl } from "@/lib/constants/api";
import { UserRole } from "@/lib/constants/permissions";

export const dynamic = "force-dynamic";

async function signin(formData: FormData) {
    "use server";

    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!username || !password) {
        redirect(`/?error=${encodeURIComponent("Введіть логін і пароль")}`);
    }

    const response = await fetch(`${backendUrl}/api/auth/signin`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
        cache: "no-store",
    }).catch(() => null);

    if (!response) {
        redirect(
            `/?error=${encodeURIComponent("Сервер авторизації недоступний")}`,
        );
    }

    if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
            message?: string | string[];
        } | null;

        const message = Array.isArray(payload?.message)
            ? payload.message[0]
            : payload?.message || "Не вдалося увійти";

        redirect(`/?error=${encodeURIComponent(message)}`);
    }

    const setCookie = response.headers.get("set-cookie") ?? "";
    const session = /(?:^|;\s*)userSession=([^;]+)/i.exec(setCookie)?.[1];
    const maxAge = /(?:^|;\s*)Max-Age=(\d+)/i.exec(setCookie)?.[1];

    if (!session) {
        redirect(`/?error=${encodeURIComponent("Сервер не повернув сесію")}`);
    }

    const cookieStore = await cookies();

    cookieStore.set("userSession", session, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        ...(maxAge ? { maxAge: Number(maxAge) } : {}),
    });

    redirect("/");
}

async function logout() {
    "use server";

    const cookieStore = await cookies();
    const session = cookieStore.get("userSession");

    if (session) {
        await fetch(`${backendUrl}/api/auth/logout`, {
            headers: {
                cookie: `userSession=${session.value}`,
            },
            cache: "no-store",
        }).catch(() => null);
    }

    cookieStore.delete("userSession");

    redirect("/");
}

export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const [user, params] = await Promise.all([getCurrentUser(), searchParams]);

    const canOpenAdmin =
        user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;

    return (
        <div className="min-h-full bg-[radial-gradient(circle_at_top,#1d2530_0%,#0d1117_38%,#08080d_75%)] px-5 py-10">
            <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-5xl items-center justify-center">
                <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.055] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9">
                    <div className="mb-8">
                        <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55">
                            animi
                        </div>

                        <h1 className="text-3xl font-semibold tracking-tight">
                            {user
                                ? `Привіт, ${user.displayName || user.username}`
                                : "Вхід до облікового запису"}
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-white/45">
                            {user
                                ? "Базова сторінка профілю на час розробки клієнта."
                                : "Авторизуйтеся, щоб продовжити."}
                        </p>
                    </div>

                    {user ? (
                        <div className="space-y-6">
                            <div className="grid gap-3 rounded-2xl border border-white/8 bg-black/15 p-4 text-sm">
                                <InfoRow
                                    label="Ім’я користувача"
                                    value={user.username}
                                />

                                <InfoRow label="Email" value={user.email} />

                                <InfoRow label="Роль" value={user.role} />

                                <InfoRow
                                    label="ID користувача"
                                    value={`#${user.id}`}
                                />
                            </div>

                            <div className="flex gap-3">
                                <form action={logout} className="flex-1">
                                    <button
                                        type="submit"
                                        className="w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition hover:bg-white/10"
                                    >
                                        Вийти
                                    </button>
                                </form>

                                {canOpenAdmin && (
                                    <Link
                                        href="/admin"
                                        className="flex-1 rounded-xl bg-(--primary) px-4 py-3 text-center text-sm font-semibold transition hover:bg-(--primary-3)"
                                    >
                                        Адмінпанель
                                    </Link>
                                )}
                            </div>
                        </div>
                    ) : (
                        <form action={signin} className="space-y-4">
                            <label className="block">
                                <span className="mb-2 block text-sm text-white/65">
                                    Логін або email
                                </span>

                                <input
                                    name="username"
                                    required
                                    autoComplete="username"
                                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition placeholder:text-white/20 focus:border-white/25 focus:bg-black/30"
                                    placeholder="username"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm text-white/65">
                                    Пароль
                                </span>

                                <input
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition placeholder:text-white/20 focus:border-white/25 focus:bg-black/30"
                                    placeholder="••••••••"
                                />
                            </label>

                            {params.error && (
                                <p className="rounded-xl border border-red-400/15 bg-red-400/8 px-3 py-2.5 text-sm text-red-200">
                                    {params.error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="w-full cursor-pointer rounded-xl bg-(--primary) px-4 py-3 font-semibold transition hover:bg-(--primary-3)"
                            >
                                Увійти
                            </button>
                        </form>
                    )}
                </section>
            </div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-white/35">{label}</span>

            <span className="min-w-0 truncate text-right text-white/80">
                {value}
            </span>
        </div>
    );
}
