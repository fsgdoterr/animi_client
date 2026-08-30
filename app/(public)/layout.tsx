import type { ReactNode } from "react";

import PublicHeader from "@/components/ui/public/header/public-header";
import PublicFooter from "@/components/ui/public/shared/public-footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <div className="public-shell min-h-full bg-[#080c0f] text-white">
            <PublicHeader />
            <main>{children}</main>
            <PublicFooter />
        </div>
    );
}
