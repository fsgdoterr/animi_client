"use client";

import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { useLazyLogoutQuery } from "@/lib/store/animi/auth-enpoints";

export default function LogoutButton() {
    const router = useRouter();
    const [logout, logoutState] = useLazyLogoutQuery();

    async function handleLogout() {
        try {
            await logout().unwrap();
            router.refresh();
        } catch {
            // Keep the current session UI if logout failed.
        }
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            disabled={logoutState.isFetching}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {logoutState.isFetching && (
                <LoaderCircle size={16} className="animate-spin" />
            )}
            Вийти
        </button>
    );
}
