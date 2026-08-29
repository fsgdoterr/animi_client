import { ImageIcon } from "lucide-react";

interface Props {
    title: string;
    subtitle: string;
}

export default function TableNotFound({ title, subtitle }: Props) {
    return (
        <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center sm:min-h-[360px]">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-white/[0.04] text-white/30">
                <ImageIcon size={22} strokeWidth={1.5} />
            </div>
            <p className="text-[17px] text-white/72">{title}</p>
            <p className="mt-1 max-w-[360px] text-[14px] text-white/35">
                {subtitle}
            </p>
        </div>
    );
}
