import type { LucideIcon } from "lucide-react";
import { Activity } from "lucide-react";

export type EntityStatMetric = {
    label: string;
    value: string | number;
    hint?: string;
};

export default function EntityStatsCard({
    title = "Статистика",
    metrics,
    icon: Icon = Activity,
}: {
    title?: string;
    metrics: EntityStatMetric[];
    icon?: LucideIcon;
}) {
    return (
        <section className="rounded-xl border border-white/[0.025] bg-[#11171c] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.12)]">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-[16px] font-medium text-white/86">{title}</h2>
                <div className="flex size-9 items-center justify-center rounded-lg bg-white/[0.035] text-white/34">
                    <Icon size={17} strokeWidth={1.8} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-white/[0.045]">
                {metrics.map((metric) => (
                    <div key={metric.label} className="min-w-0 bg-[#151b20] p-3">
                        <p className="truncate text-[12px] text-white/34">{metric.label}</p>
                        <p className="mt-1 truncate text-[20px] leading-none text-white/86">
                            {typeof metric.value === "number"
                                ? metric.value.toLocaleString("uk-UA")
                                : metric.value}
                        </p>
                        {metric.hint && (
                            <p className="mt-1 truncate text-[11px] text-white/24">{metric.hint}</p>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
