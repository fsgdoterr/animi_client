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
        <div className="h-full overflow-hidden bg-[#070b0c] p-3 sm:p-5 lg:p-8 xl:p-10 2xl:p-12">
            <div className="mx-auto flex h-full min-h-0 w-full max-w-[1540px] flex-col gap-3 lg:flex-row lg:gap-4">
                <AdminSidebar />
                <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
