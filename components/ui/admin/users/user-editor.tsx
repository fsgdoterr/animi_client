"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import AvatarPicker from "@/components/ui/admin/users/avatar-picker";
import EntityStatsCard from "@/components/ui/admin/shared/entity-stats-card";
import {
    EditorBody,
    EditorError,
    EditorHeader,
    EditorPanel,
    SystemInfoCard,
} from "@/components/ui/admin/shared/editor-layout";
import { createFieldReset } from "@/components/ui/admin/shared/field-reset-config";
import FieldResetButton from "@/components/ui/admin/shared/field-reset-button";
import { FormField } from "@/components/ui/admin/shared/form-field";
import { Input } from "@/components/ui/inputs/input";
import { Select, type SelectOption } from "@/components/ui/dropdowns/select";
import {
    MultiSelect,
    type MultiSelectOption,
} from "@/components/ui/dropdowns/multi-select";
import { Permissions, UserRole } from "@/lib/constants/permissions";
import {
    useCreateUserMutation,
    useUpdateUserMutation,
} from "@/lib/store/animi/user-endpoints";
import type { PrivateUser, UserPayload } from "@/lib/types/entites/user";
import type { UserStats } from "@/lib/types/admin-stats";
import { formatDate } from "@/lib/utils/format-date";

type UserFormValues = {
    username: string;
    email: string;
    displayName: string;
    password: string;
    avatar: number | null;
    role: UserRole;
    permissions: Permissions[];
};

const roleOptions: SelectOption<UserRole>[] = [
    { value: UserRole.USER, label: "Користувач" },
    { value: UserRole.MODER, label: "Модератор" },
    { value: UserRole.ADMIN, label: "Адміністратор" },
    { value: UserRole.SUPER_ADMIN, label: "Суперадмін" },
];

const permissionOptions: MultiSelectOption<Permissions>[] = [
    { value: Permissions.DEF, label: "DEF" },
];

export default function UserEditor({ user, stats }: { user: PrivateUser | null; stats?: UserStats }) {
    const router = useRouter();
    const [createUser, createState] = useCreateUserMutation();
    const [updateUser, updateState] = useUpdateUserMutation();
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        resetField,
        formState: { errors, dirtyFields },
    } = useForm<UserFormValues>({
        defaultValues: {
            username: user?.username ?? "",
            email: user?.email ?? "",
            displayName: user?.displayName ?? "",
            password: "",
            avatar: user?.avatar?.id ?? null,
            role: user?.role ?? UserRole.USER,
            permissions: user?.permissions ?? [Permissions.DEF],
        },
    });

    const avatar = watch("avatar");
    const role = watch("role");
    const permissions = watch("permissions");

    const fieldReset = (field: keyof UserFormValues, ariaLabel: string) =>
        createFieldReset(
            Boolean(user),
            dirtyFields[field],
            () => resetField(field),
            ariaLabel,
        );

    const isSaving = createState.isLoading || updateState.isLoading;
    const mutationError = createState.error ?? updateState.error;

    const onSubmit = handleSubmit(async (values) => {
        const username = values.username.trim();
        const email = values.email.trim();
        const displayName = values.displayName.trim();

        try {
            if (user) {
                const body: Partial<UserPayload> = {};
                if (dirtyFields.username) body.username = username;
                if (dirtyFields.email) body.email = email;
                if (dirtyFields.displayName) body.displayName = displayName || null;
                if (dirtyFields.password && values.password)
                    body.password = values.password;
                if (dirtyFields.avatar) body.avatar = values.avatar;
                if (dirtyFields.role) body.role = values.role;
                if (dirtyFields.permissions) body.permissions = values.permissions;

                if (Object.keys(body).length > 0) {
                    await updateUser({ id: user.id, body }).unwrap();
                }
            } else {
                await createUser({
                    username,
                    email,
                    password: values.password,
                    displayName: displayName || undefined,
                    avatar: values.avatar,
                    role: values.role,
                    permissions: values.permissions,
                }).unwrap();
            }

            router.push("/admin/users");
        } catch {
            // Mutation error is rendered below the header.
        }
    });

    return (
        <form
            onSubmit={onSubmit}
            className="flex min-h-full min-w-0 flex-1 flex-col lg:h-full lg:min-h-0"
        >
            <EditorHeader
                backHref="/admin/users"
                backLabel="Назад до користувачів"
                title={
                    user
                        ? "Користувач"
                        : "Створення користувача"
                }
                subtitle={
                    user
                        ? `${user.displayName || user.username} · @${user.username} · #${user.id}`
                        : undefined
                }
                isSaving={isSaving}
                submitLabel={user ? "Зберегти" : "Створити"}
            />
            <EditorError error={mutationError} />
            <EditorBody
                sidebar={
                    user ? (
                        <div className="grid gap-3">
                            {stats && (
                                <EntityStatsCard
                                    title="Активність"
                                    metrics={[
                                        { label: "Перегляди", value: stats.views },
                                        { label: "За 30 днів", value: stats.views30 },
                                        { label: "Оцінки", value: stats.reviews, hint: stats.averageRating == null ? "Без оцінок" : `Середня ${stats.averageRating.toFixed(1)}` },
                                        { label: "Підписки", value: stats.subscriptions },
                                        { label: "Коментарі", value: stats.comments },
                                        { label: "Плейлисти", value: stats.playlists },
                                        { label: "Створено аніме", value: stats.createdAnime },
                                        { label: "Активні сесії", value: stats.activeSessions },
                                    ]}
                                />
                            )}
                            {stats?.lastViewAt && (
                                <div className="rounded-xl border border-white/[0.025] bg-[#11171c] px-4 py-3 text-[12px] text-white/34">
                                    Останній перегляд: <span className="text-white/62">{formatDate(stats.lastViewAt)}</span>
                                </div>
                            )}
                            <SystemInfoCard
                            id={user.id}
                            createdAt={user.createdAt}
                            updatedAt={user.updatedAt}
                            />
                        </div>
                    ) : undefined
                }
            >
                <EditorPanel>
                    <div className="grid gap-7">
                        <section>
                            <h2 className="mb-5 text-[17px] font-medium text-white/88">
                                Основна інформація
                            </h2>
                            <div className="grid gap-5 lg:grid-cols-2">
                                <FormField
                                    label="Username"
                                    reset={fieldReset("username", "Скинути username")}
                                    error={errors.username?.message}
                                >
                                    <Input
                                        {...register("username", {
                                            required: "Вкажіть username.",
                                            minLength: {
                                                value: 4,
                                                message: "Мінімум 4 символи.",
                                            },
                                            maxLength: {
                                                value: 40,
                                                message: "Максимум 40 символів.",
                                            },
                                            validate: (value) =>
                                                value.trim().length >= 4 ||
                                                "Мінімум 4 символи.",
                                        })}
                                        autoFocus={!user}
                                        placeholder="username"
                                        className="h-12 bg-[#181e23]"
                                    />
                                </FormField>

                                <FormField
                                    label="Email"
                                    reset={fieldReset("email", "Скинути email")}
                                    error={errors.email?.message}
                                >
                                    <Input
                                        type="email"
                                        {...register("email", {
                                            required: "Вкажіть email.",
                                            validate: (value) =>
                                                /^\S+@\S+\.\S+$/.test(value.trim()) ||
                                                "Вкажіть коректний email.",
                                        })}
                                        placeholder="user@example.com"
                                        className="h-12 bg-[#181e23]"
                                    />
                                </FormField>

                                <FormField
                                    label="Display name"
                                    reset={fieldReset("displayName", "Скинути display name")}
                                >
                                    <Input
                                        {...register("displayName")}
                                        placeholder="Ім'я, яке бачать інші"
                                        className="h-12 bg-[#181e23]"
                                    />
                                </FormField>

                                <FormField
                                    label={user ? "Новий пароль" : "Пароль"}
                                    reset={fieldReset("password", "Очистити новий пароль")}
                                    error={errors.password?.message}
                                >
                                    <Input
                                        type="password"
                                        {...register("password", {
                                            required: user ? false : "Вкажіть пароль.",
                                            validate: (value) =>
                                                !value ||
                                                (value.length >= 6 && value.length <= 40) ||
                                                "Пароль має містити від 6 до 40 символів.",
                                        })}
                                        placeholder={
                                            user
                                                ? "Залиште порожнім, щоб не змінювати"
                                                : "Мінімум 6 символів"
                                        }
                                        className="h-12 bg-[#181e23]"
                                    />
                                </FormField>
                            </div>
                        </section>

                        <section className="border-t border-white/[0.06] pt-6">
                            <h2 className="mb-5 text-[17px] font-medium text-white/88">
                                Доступ
                            </h2>
                            <div className="grid gap-5 lg:grid-cols-2">
                                <FormField
                                    label="Роль"
                                    reset={fieldReset("role", "Скинути роль")}
                                >
                                    <Select
                                        value={role}
                                        options={roleOptions}
                                        onChange={(value) =>
                                            setValue("role", value, {
                                                shouldDirty: true,
                                                shouldTouch: true,
                                            })
                                        }
                                        className="w-full min-w-0"
                                    />
                                </FormField>
                                <FormField
                                    label="Permissions"
                                    reset={fieldReset("permissions", "Скинути permissions")}
                                >
                                    <MultiSelect
                                        value={permissions}
                                        options={permissionOptions}
                                        onChange={(value) =>
                                            setValue("permissions", value, {
                                                shouldDirty: true,
                                                shouldTouch: true,
                                            })
                                        }
                                        className="w-full min-w-0"
                                    />
                                </FormField>
                            </div>
                        </section>

                        <section className="border-t border-white/[0.06] pt-6">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-[17px] font-medium text-white/88">
                                        Аватар
                                    </h2>
                                    <p className="mt-1 max-w-[620px] text-[14px] leading-5 text-white/35">
                                        Для користувача бекенд приймає ID вже
                                        завантаженого зображення.
                                    </p>
                                </div>
                                {user && (
                                    <FieldResetButton
                                        disabled={!dirtyFields.avatar}
                                        onClick={() => resetField("avatar")}
                                        ariaLabel="Скинути аватар"
                                    />
                                )}
                            </div>
                            <div className="mt-4">
                                <AvatarPicker
                                    value={avatar}
                                    initialAvatar={user?.avatar ?? null}
                                    onChange={(value) =>
                                        setValue("avatar", value, {
                                            shouldDirty: true,
                                            shouldTouch: true,
                                        })
                                    }
                                />
                            </div>
                        </section>
                    </div>
                </EditorPanel>
            </EditorBody>
        </form>
    );
}
