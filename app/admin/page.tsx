export default function AdminPage() {
    return (
        <div className="flex h-full min-h-0 flex-1 flex-col">
            <header className="flex min-h-11 shrink-0 items-center px-0.5 lg:min-h-[45px]">
                <h1 className="text-[24px] leading-tight text-white/90 sm:text-[26px] sm:leading-none">
                    Дашборд
                </h1>
            </header>

            <section
                aria-label="Вміст дашборду"
                className="mt-3 min-h-[280px] flex-1 rounded-xl border border-white/[0.02] bg-[#11171c] shadow-[0_18px_60px_rgba(0,0,0,0.12)] sm:min-h-[420px] lg:min-h-0"
            />
        </div>
    );
}
