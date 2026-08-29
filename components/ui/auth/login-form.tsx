"use client";

import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";

import { useSigninMutation } from "@/lib/store/animi/auth-enpoints";
import { getErrorMessage } from "@/lib/utils/get-error-message";

type LoginFormValues = {
    username: string;
    password: string;
};

export default function LoginForm() {
    const router = useRouter();
    const [signin, signinState] = useSigninMutation();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            await signin({
                username: values.username.trim(),
                password: values.password,
            }).unwrap();
            router.refresh();
        } catch {
            // The mutation error is displayed below the fields.
        }
    });

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
                <span className="mb-2 block text-sm text-white/65">
                    Логін або email
                </span>
                <input
                    {...register("username", {
                        required: "Введіть логін або email",
                        validate: (value) =>
                            value.trim().length > 0 || "Введіть логін або email",
                    })}
                    autoComplete="username"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition placeholder:text-white/20 focus:border-white/25 focus:bg-black/30"
                    placeholder="username"
                />
                {errors.username && (
                    <span className="mt-1.5 block text-xs text-red-200/85">
                        {errors.username.message}
                    </span>
                )}
            </label>

            <label className="block">
                <span className="mb-2 block text-sm text-white/65">Пароль</span>
                <input
                    {...register("password", {
                        required: "Введіть пароль",
                    })}
                    type="password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition placeholder:text-white/20 focus:border-white/25 focus:bg-black/30"
                    placeholder="••••••••"
                />
                {errors.password && (
                    <span className="mt-1.5 block text-xs text-red-200/85">
                        {errors.password.message}
                    </span>
                )}
            </label>

            {signinState.error && (
                <p className="rounded-xl border border-red-400/15 bg-red-400/8 px-3 py-2.5 text-sm text-red-200">
                    {getErrorMessage(signinState.error)}
                </p>
            )}

            <button
                type="submit"
                disabled={signinState.isLoading}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-(--primary) px-4 py-3 font-semibold transition hover:bg-(--primary-3) disabled:cursor-not-allowed disabled:opacity-60"
            >
                {signinState.isLoading && (
                    <LoaderCircle size={17} className="animate-spin" />
                )}
                Увійти
            </button>
        </form>
    );
}
