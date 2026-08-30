"use client";

import { KeyRound, LoaderCircle, Mail, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useSigninMutation, useSignupMutation } from "@/lib/store/animi/auth-enpoints";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import cn from "@/lib/utils/cn";

type Mode = "signin" | "signup";
type FormValues = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};

const EXIT_DURATION = 180;

export default function PublicAuthModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>("signin");
    const [mounted, setMounted] = useState(open);
    const [shown, setShown] = useState(false);
    const [signin, signinState] = useSigninMutation();
    const [signup, signupState] = useSignupMutation();
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
    });

    useEffect(() => {
        if (open) {
            setMounted(true);

            // Two frames guarantee that the hidden initial state is painted
            // before we switch to the visible state. A single rAF can still
            // be batched with the mount by React, which skips the enter transition.
            let secondFrame = 0;
            const firstFrame = window.requestAnimationFrame(() => {
                secondFrame = window.requestAnimationFrame(() => setShown(true));
            });

            return () => {
                window.cancelAnimationFrame(firstFrame);
                if (secondFrame) window.cancelAnimationFrame(secondFrame);
            };
        }

        setShown(false);
        const timeout = window.setTimeout(() => setMounted(false), EXIT_DURATION);
        return () => window.clearTimeout(timeout);
    }, [open]);

    useEffect(() => {
        if (!mounted) return;
        const root = document.documentElement;
        const previousRootOverflow = root.style.overflow;
        const previousBodyOverflow = document.body.style.overflow;

        root.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            root.style.overflow = previousRootOverflow;
            document.body.style.overflow = previousBodyOverflow;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [mounted, onClose]);

    useEffect(() => {
        if (!mounted && !open) {
            setMode("signin");
            reset();
        }
    }, [mounted, open, reset]);

    if (!mounted) return null;

    const isSignup = mode === "signup";
    const mutationState = isSignup ? signupState : signinState;
    const password = watch("password");

    const submit = handleSubmit(async (values) => {
        try {
            if (isSignup) {
                await signup({
                    email: values.email.trim(),
                    username: values.username.trim(),
                    password: values.password,
                }).unwrap();
            } else {
                await signin({
                    username: values.username.trim(),
                    password: values.password,
                }).unwrap();
            }
            onClose();
            router.refresh();
        } catch {
            // RTK Query error is rendered below.
        }
    });

    return (
        <div
            className={cn(
                "fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 transition-[opacity,backdrop-filter] duration-200 ease-out motion-reduce:transition-none",
                shown ? "opacity-100 backdrop-blur-md" : "opacity-0 backdrop-blur-none",
            )}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                className={cn(
                    "w-full max-w-[390px] rounded-2xl border border-white/[0.08] bg-[#0b1014] p-4 shadow-[0_28px_90px_rgba(0,0,0,.58)] transition-[opacity,transform] duration-200 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none sm:p-5",
                    shown
                        ? "translate-y-0 scale-100 opacity-100"
                        : "translate-y-2 scale-[0.92] opacity-0",
                )}
            >
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-[17px] font-medium text-white/90">
                        {mode === "signin" ? "Авторизація" : "Реєстрація"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="grid size-8 cursor-pointer place-items-center rounded-lg text-white/55 transition hover:bg-white/7 hover:text-white"
                        aria-label="Закрити"
                    >
                        <X size={19} />
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-2.5">
                    {mutationState.error && (
                        <div className="rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-[13px] text-red-300">
                            {getErrorMessage(mutationState.error)}
                        </div>
                    )}

                    {isSignup && (
                        <Field icon={<Mail size={16} />} error={errors.email?.message}>
                            <input
                                {...register("email", {
                                    required: "Введіть емейл",
                                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Невалідний емейл" },
                                })}
                                type="email"
                                autoComplete="email"
                                placeholder="Емейл"
                                className="public-auth-input"
                            />
                        </Field>
                    )}

                    <Field icon={<UserRound size={16} />} error={errors.username?.message}>
                        <input
                            {...register("username", {
                                required: isSignup ? "Введіть ім’я користувача" : "Введіть логін або емейл",
                                minLength: isSignup ? { value: 4, message: "Мінімум 4 символи" } : undefined,
                            })}
                            autoComplete="username"
                            placeholder={isSignup ? "Ім’я користувача" : "Пошта або ім’я користувача"}
                            className="public-auth-input"
                        />
                    </Field>

                    <Field icon={<KeyRound size={16} />} error={errors.password?.message}>
                        <input
                            {...register("password", {
                                required: "Введіть пароль",
                                minLength: isSignup ? { value: 6, message: "Мінімум 6 символів" } : undefined,
                            })}
                            type="password"
                            autoComplete={isSignup ? "new-password" : "current-password"}
                            placeholder="Пароль"
                            className="public-auth-input"
                        />
                    </Field>

                    {isSignup && (
                        <Field icon={<KeyRound size={16} />} error={errors.confirmPassword?.message}>
                            <input
                                {...register("confirmPassword", {
                                    required: "Підтвердіть пароль",
                                    validate: (value) => value === password || "Паролі не співпадають",
                                })}
                                type="password"
                                autoComplete="new-password"
                                placeholder="Підтвердіть пароль"
                                className="public-auth-input"
                            />
                        </Field>
                    )}

                    <button
                        type="submit"
                        disabled={mutationState.isLoading}
                        className="mt-1 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-(--primary) text-sm font-medium transition hover:bg-(--primary-3) disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {mutationState.isLoading && <LoaderCircle size={16} className="animate-spin" />}
                        {isSignup ? "Зареєструватись" : "Увійти"}
                    </button>

                    <div className="pt-1 text-center text-[13px] leading-5 text-white/40">
                        {isSignup ? "Вже є акаунт? " : "Ще не маєте акаунта? "}
                        <button
                            type="button"
                            onClick={() => {
                                setMode(isSignup ? "signin" : "signup");
                                reset();
                            }}
                            className="cursor-pointer text-(--primary-3) underline-offset-2 hover:underline"
                        >
                            {isSignup ? "Увійти" : "Зареєструватись"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({
    icon,
    error,
    children,
}: {
    icon: React.ReactNode;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div
                className={cn(
                    "flex h-10 items-center gap-2 rounded-lg border bg-[#171d22] px-3 text-white/45 transition focus-within:border-white/18 focus-within:bg-[#1a2026]",
                    error ? "border-red-500/45" : "border-white/[0.045]",
                )}
            >
                {icon}
                {children}
            </div>
            {error && <p className="mt-1 px-1 text-[12px] text-red-300/90">{error}</p>}
        </div>
    );
}
