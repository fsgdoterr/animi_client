"use client";

import {
    CalendarRange,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { IconButton } from "@/components/ui/buttons/icon-button";
import type { ReleaseFilterMode } from "@/components/ui/public/catalog/catalog-types";
import {
    getReleaseLabel,
    getReleaseYears,
    releaseSeasons,
} from "@/components/ui/public/catalog/release-period";
import { useDropdown } from "@/lib/hooks/use-dropdown";
import cn from "@/lib/utils/cn";

interface ReleaseRangeSelectProps {
    mode: ReleaseFilterMode;
    from: string;
    to: string;
    years: number[];
    disabled?: boolean;
    onChange: (value: {
        mode: ReleaseFilterMode;
        from: string;
        to: string;
    }) => void;
}

type RangeSide = "from" | "to";

function periodYear(value: string) {
    const [, rawYear] = value.split(":");
    const year = Number(rawYear);
    return Number.isFinite(year) ? year : null;
}

function periodPart(value: string) {
    if (value.startsWith("year:")) return "year";
    if (!value.startsWith("season:")) return null;
    return value.split(":")[2] ?? null;
}

function periodValue(year: number, part: string) {
    return part === "year" ? `year:${year}` : `season:${year}:${part}`;
}

function decadeStart(year: number) {
    return Math.floor(year / 10) * 10;
}

export default function ReleaseRangeSelect({
    mode,
    from,
    to,
    years,
    disabled,
    onChange,
}: ReleaseRangeSelectProps) {
    const { rootRef, isOpen, setIsOpen } = useDropdown();
    const selectableYears = useMemo(() => getReleaseYears(years), [years]);
    const latestYear = selectableYears[0] ?? 2000;
    const oldestYear = selectableYears[selectableYears.length - 1] ?? latestYear;
    const [rangeSide, setRangeSide] = useState<RangeSide>("from");
    const [pickerYear, setPickerYear] = useState(latestYear);
    const [visibleDecade, setVisibleDecade] = useState(decadeStart(latestYear));
    const hasValue = Boolean(from || to);

    const fromLabel = getReleaseLabel(from, years);
    const toLabel = getReleaseLabel(to, years);
    const label = mode === "single"
        ? fromLabel || "Будь-який"
        : fromLabel && toLabel
            ? from === to
                ? fromLabel
                : `${fromLabel} — ${toLabel}`
            : fromLabel
                ? `від ${fromLabel}`
                : toLabel
                    ? `до ${toLabel}`
                    : "Будь-який";

    const activeValue = mode === "single" || rangeSide === "from" ? from : to;
    const selectedPart = periodYear(activeValue) === pickerYear
        ? periodPart(activeValue)
        : null;

    const decadeYears = Array.from({ length: 10 }, (_, index) => visibleDecade + index)
        .filter((year) => year >= oldestYear && year <= latestYear)
        .sort((a, b) => b - a);

    const canGoNewer = visibleDecade + 10 <= decadeStart(latestYear);
    const canGoOlder = visibleDecade > decadeStart(oldestYear);

    useEffect(() => {
        if (!isOpen) return;
        const nextValue = mode === "single" || rangeSide === "from" ? from : to;
        const nextYear = periodYear(nextValue) ?? periodYear(from) ?? latestYear;
        setPickerYear(nextYear);
        setVisibleDecade(decadeStart(nextYear));
    }, [isOpen, mode, rangeSide, from, to, latestYear]);

    function changeMode(nextMode: ReleaseFilterMode) {
        if (nextMode === mode) return;

        setRangeSide("from");
        onChange({
            mode: nextMode,
            from,
            to: nextMode === "range" ? (to || from) : "",
        });
    }

    function choosePeriod(part: string) {
        const value = periodValue(pickerYear, part);

        if (mode === "single") {
            onChange({ mode, from: value, to: "" });
            return;
        }

        if (rangeSide === "from") {
            onChange({ mode, from: value, to });
            setRangeSide("to");
        } else {
            onChange({ mode, from, to: value });
        }
    }

    function chooseRangeSide(side: RangeSide) {
        setRangeSide(side);
        const value = side === "from" ? from : to;
        const year = periodYear(value) ?? periodYear(from) ?? latestYear;
        setPickerYear(year);
        setVisibleDecade(decadeStart(year));
    }

    return (
        <div ref={rootRef} className="relative min-w-0">
            <button
                type="button"
                disabled={disabled}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((value) => !value)}
                className={cn(
                    "flex h-11 w-full items-center gap-2 rounded-lg",
                    "border border-white/[0.035] bg-[#171d22] px-3.5",
                    "text-left text-[15px] outline-none transition",
                    "hover:bg-[#1a2026] focus:border-white/14",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                )}
            >
                <CalendarRange size={17} className="shrink-0 text-white/34" />
                <span className="min-w-0 flex-1 truncate">
                    <span className="mr-1 text-white/38">Реліз:</span>
                    <span className={hasValue ? "text-white/88" : "text-white/32"}>
                        {label}
                    </span>
                </span>
                <ChevronDown
                    size={18}
                    className={cn(
                        "shrink-0 text-white/40 transition-transform duration-200",
                        isOpen && "rotate-180",
                    )}
                />
            </button>

            {isOpen && (
                <div
                    role="dialog"
                    aria-label="Період релізу"
                    className="absolute left-0 top-[calc(100%+6px)] z-[100] w-[min(520px,calc(100vw-2rem))] rounded-2xl border border-white/[0.065] bg-[#202a32] p-3.5 shadow-2xl shadow-black/55"
                >
                    <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[13px] font-medium text-white/88">Період релізу</p>
                            <p className="mt-0.5 text-[11px] leading-4 text-white/36">
                                Оберіть рік, а потім увесь рік або конкретний сезон.
                            </p>
                        </div>
                        <IconButton
                            type="button"
                            variant="ghost"
                            className="size-8 rounded-lg text-white/42"
                            disabled={!hasValue}
                            onClick={() => {
                                setRangeSide("from");
                                onChange({ mode: "single", from: "", to: "" });
                            }}
                            aria-label="Скинути період релізу"
                            title="Скинути період"
                        >
                            <RotateCcw size={15} />
                        </IconButton>
                    </div>

                    <div className="mb-3 grid grid-cols-2 rounded-lg bg-black/20 p-1">
                        <button
                            type="button"
                            onClick={() => changeMode("single")}
                            className={cn(
                                "h-8 rounded-md px-3 text-[12px] font-medium transition",
                                mode === "single"
                                    ? "bg-white/[0.09] text-white/90 shadow-sm"
                                    : "text-white/42 hover:text-white/65",
                            )}
                        >
                            Один період
                        </button>
                        <button
                            type="button"
                            onClick={() => changeMode("range")}
                            className={cn(
                                "h-8 rounded-md px-3 text-[12px] font-medium transition",
                                mode === "range"
                                    ? "bg-white/[0.09] text-white/90 shadow-sm"
                                    : "text-white/42 hover:text-white/65",
                            )}
                        >
                            Діапазон
                        </button>
                    </div>

                    {mode === "range" && (
                        <div className="mb-3 grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => chooseRangeSide("from")}
                                className={cn(
                                    "rounded-xl border px-3 py-2 text-left transition",
                                    rangeSide === "from"
                                        ? "border-violet-300/20 bg-violet-300/[0.075]"
                                        : "border-white/[0.045] bg-black/10 hover:bg-white/[0.035]",
                                )}
                            >
                                <span className="block text-[10px] uppercase tracking-[0.14em] text-white/30">Від</span>
                                <span className="mt-0.5 block truncate text-[12px] text-white/78">
                                    {fromLabel || "Не вибрано"}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => chooseRangeSide("to")}
                                className={cn(
                                    "rounded-xl border px-3 py-2 text-left transition",
                                    rangeSide === "to"
                                        ? "border-violet-300/20 bg-violet-300/[0.075]"
                                        : "border-white/[0.045] bg-black/10 hover:bg-white/[0.035]",
                                )}
                            >
                                <span className="block text-[10px] uppercase tracking-[0.14em] text-white/30">До</span>
                                <span className="mt-0.5 block truncate text-[12px] text-white/78">
                                    {toLabel || "Не вибрано"}
                                </span>
                            </button>
                        </div>
                    )}

                    <div className="rounded-xl border border-white/[0.045] bg-black/10 p-2.5">
                        <div className="mb-2.5 flex items-center justify-between gap-2">
                            <IconButton
                                type="button"
                                variant="ghost"
                                className="size-8 rounded-lg"
                                disabled={!canGoOlder}
                                onClick={() => setVisibleDecade((value) => value - 10)}
                                aria-label="Попереднє десятиліття"
                                title="Попереднє десятиліття"
                            >
                                <ChevronLeft size={16} />
                            </IconButton>

                            <div className="text-center">
                                <p className="text-[12px] font-medium text-white/80">
                                    {Math.max(visibleDecade, oldestYear)}–{Math.min(visibleDecade + 9, latestYear)}
                                </p>
                                <p className="text-[10px] text-white/28">Оберіть рік</p>
                            </div>

                            <IconButton
                                type="button"
                                variant="ghost"
                                className="size-8 rounded-lg"
                                disabled={!canGoNewer}
                                onClick={() => setVisibleDecade((value) => value + 10)}
                                aria-label="Наступне десятиліття"
                                title="Наступне десятиліття"
                            >
                                <ChevronRight size={16} />
                            </IconButton>
                        </div>

                        <div className="grid grid-cols-5 gap-1.5">
                            {decadeYears.map((year) => (
                                <button
                                    key={year}
                                    type="button"
                                    onClick={() => setPickerYear(year)}
                                    className={cn(
                                        "h-9 rounded-lg text-[12px] font-medium transition",
                                        year === pickerYear
                                            ? "bg-violet-300/15 text-violet-100 ring-1 ring-inset ring-violet-300/20"
                                            : "bg-white/[0.035] text-white/54 hover:bg-white/[0.07] hover:text-white/82",
                                    )}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
                        <button
                            type="button"
                            onClick={() => choosePeriod("year")}
                            className={cn(
                                "h-9 rounded-lg border px-2 text-[11px] font-medium transition sm:col-span-1",
                                selectedPart === "year"
                                    ? "border-violet-300/20 bg-violet-300/[0.11] text-violet-100"
                                    : "border-white/[0.045] bg-white/[0.025] text-white/48 hover:bg-white/[0.06] hover:text-white/78",
                            )}
                        >
                            Весь рік
                        </button>
                        {releaseSeasons.map((season) => (
                            <button
                                key={season.value}
                                type="button"
                                onClick={() => choosePeriod(season.value)}
                                className={cn(
                                    "h-9 rounded-lg border px-2 text-[11px] font-medium transition",
                                    selectedPart === season.value
                                        ? "border-violet-300/20 bg-violet-300/[0.11] text-violet-100"
                                        : "border-white/[0.045] bg-white/[0.025] text-white/48 hover:bg-white/[0.06] hover:text-white/78",
                                )}
                            >
                                {season.label}
                            </button>
                        ))}
                    </div>

                    {mode === "range" && rangeSide === "from" && (
                        <p className="mt-2 text-center text-[10px] text-white/25">
                            Після вибору періоду автоматично перейдемо до межі «До».
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
