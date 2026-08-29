import { getErrorMessage } from "@/lib/utils/get-error-message";

export default function ErrorAlert({ error }: { error: unknown }) {
    if (!error) return null;

    return (
        <div className="mt-3 shrink-0 rounded-lg border border-red-400/15 bg-red-500/[0.07] px-4 py-3 text-[14px] text-red-200/90">
            {getErrorMessage(error)}
        </div>
    );
}
