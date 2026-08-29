import { LoaderCircle } from "lucide-react";

interface Props {
    title: string;
}

export default function TableLoading({ title }: Props) {
    return (
        <div className="flex min-h-[260px] items-center justify-center gap-2 px-4 text-center text-[15px] text-white/45 sm:min-h-[360px]">
            <LoaderCircle className="animate-spin" size={19} />
            {title}
        </div>
    );
}
