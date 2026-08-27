export default function AdminPage() {
    return (
        <div className="flex flex-1 flex-col">
            <header className="flex h-11 items-center px-0.5 lg:h-[45px]">
                <h1 className="text-[26px] leading-none text-white/90">
                    Дашборд
                </h1>
            </header>

            <section
                aria-label="Вміст дашборду"
                className="mt-2 min-h-[520px] flex-1 rounded-xl border border-white/[0.02] bg-[#11171c] shadow-[0_18px_60px_rgba(0,0,0,0.12)]"
            />
        </div>
    );
}
