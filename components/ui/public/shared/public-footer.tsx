import PublicLogo from "@/components/ui/public/shared/public-logo";

export default function PublicFooter() {
    return (
        <footer className="border-t border-white/[0.05] bg-[#0d1217] px-5 py-7 sm:px-8 lg:px-12">
            <div className="mx-auto w-full max-w-[1480px]">
                <PublicLogo className="text-[20px]" />
                <p className="mt-2 max-w-2xl text-[13px] leading-5 text-white/45 sm:text-sm">
                    Дивись аніме українською онлайн. Новинки, фільми, OVA, ONA та улюблені тайтли в одному місці.
                </p>
                <p className="mt-2 text-[13px] text-white/25">© {new Date().getFullYear()} Animi</p>
            </div>
        </footer>
    );
}
