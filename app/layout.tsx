import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/providers";
import { didactGothic, inter } from "@/lib/utils/fonts";

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang="uk"
            className={`h-full antialiased`}
            suppressHydrationWarning
        >
            <body className={`${didactGothic.className} `}>
                <Providers>
                    <div className="h-dvh flex">
                        <main className="flex-1">{children}</main>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
