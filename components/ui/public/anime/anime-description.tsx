"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function AnimeDescription({ description }: { description: string | null }) {
    const [expanded, setExpanded] = useState(false);

    if (!description) {
        return <p className="text-[11px] leading-[1.5] text-white/42">Опис поки що не додано.</p>;
    }

    if (description.length < 280) {
        return <p className="whitespace-pre-line text-[11px] leading-[1.5] text-white/50">{description}</p>;
    }

    return (
        <div>
            <p className={`${expanded ? "" : "line-clamp-4"} whitespace-pre-line text-[11px] leading-[1.5] text-white/50`}>
                {description}
            </p>
            <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="mt-1.5 inline-flex cursor-pointer items-center gap-1 text-[10px] font-medium text-white/30 transition hover:text-white/55"
            >
                {expanded ? "Згорнути" : "Показати більше"}
                <ChevronDown size={12} className={`transition ${expanded ? "rotate-180" : ""}`} />
            </button>
        </div>
    );
}
