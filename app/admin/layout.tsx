import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import AdminSidebar from "@/components/ui/admin/admin-sidebar";
import { getCurrentUser } from "@/lib/auth/server";
import { UserRole } from "@/lib/constants/permissions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const user = await getCurrentUser();

    if (!user) notFound();

    const hasAccess =
        user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;

    if (!hasAccess) notFound();

    return (
        <div className="min-h-full bg-[#070b0c] p-5 sm:p-7 lg:p-10 xl:p-14">
            <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-[1540px] flex-col gap-4 lg:min-h-[calc(100dvh-5rem)] lg:flex-row">
                <AdminSidebar />
                <main className="flex min-w-0 flex-1">{children}</main>
            </div>
        </div>
    );
}
