import { Image as ImageType } from "@/lib/types/entites/image-type";
import { ImageIcon } from "lucide-react";
import Image from "next/image";

interface Props {
    poster: ImageType | null;
    title: string;
}

export default function TablePoster({ poster, title }: Props) {
    if (!poster) {
        return (
            <div className="flex h-12 w-9 shrink-0 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.035] text-white/28">
                <ImageIcon size={17} strokeWidth={1.6} />
            </div>
        );
    }

    return (
        <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md border border-white/[0.08] bg-white/[0.035]">
            <Image
                src={`/uploads/${encodeURIComponent(poster.path)}`}
                alt={`Постер '${title}'`}
                fill
                unoptimized
                sizes="36px"
                className="object-cover"
            />
        </div>
    );
}
