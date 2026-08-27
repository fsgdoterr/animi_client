import "./globals.css";

import Providers from "@/components/providers/providers";
import { getCurrentUser } from "@/lib/auth/server";
import { didactGothic } from "@/lib/utils/fonts";

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
    const user = await getCurrentUser();

    return (
        <html
            lang="uk"
            className="h-full antialiased"
            suppressHydrationWarning
        >
            <body className={didactGothic.className}>
                <Providers initialUser={user}>
                    <div className="h-dvh">{children}</div>
                </Providers>
            </body>
        </html>
    );
}
