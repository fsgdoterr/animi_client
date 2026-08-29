"use client";

import Image from "next/image";
import { UserRound } from "lucide-react";

import AdminListPage from "@/components/ui/admin/shared/admin-list-page";
import EntityActions from "@/components/ui/admin/shared/entity-actions";
import type { SelectOption } from "@/components/ui/dropdowns/select";
import { UserRole } from "@/lib/constants/permissions";
import {
    ADMIN_LIST_PAGE_SIZE,
    useAdminListControls,
    useClampPage,
} from "@/lib/hooks/use-admin-list-controls";
import {
    useDeleteUserMutation,
    useGetUsersQuery,
} from "@/lib/store/animi/user-endpoints";
import type { PrivateUser } from "@/lib/types/entites/user";
import { formatDate } from "@/lib/utils/format-date";

type SortMode = "new" | "old" | "username";

const roleLabels: Record<UserRole, string> = {
    [UserRole.USER]: "Користувач",
    [UserRole.MODER]: "Модератор",
    [UserRole.ADMIN]: "Адміністратор",
    [UserRole.SUPER_ADMIN]: "Суперадмін",
};

const sortOptions: SelectOption<SortMode>[] = [
    { value: "new", label: "Нові" },
    { value: "old", label: "Старі" },
    { value: "username", label: "А-Я" },
];

export default function UserList() {
    const controls = useAdminListControls<SortMode>("new");
    const [deleteUser, deleteState] = useDeleteUserMutation();
    const { data, isLoading, isFetching, error } = useGetUsersQuery({
        search: controls.deferredSearch || undefined,
        sort: controls.sortMode,
        page: controls.page,
        limit: ADMIN_LIST_PAGE_SIZE,
    });

    useClampPage(controls.page, data?.totalPages, controls.setPage);

    const users = data?.items ?? [];

    async function handleDelete(user: PrivateUser) {
        if (
            !window.confirm(
                `Видалити користувача «${user.username}»? Цю дію не можна скасувати.`,
            )
        ) {
            return;
        }

        try {
            await deleteUser(user.id).unwrap();
        } catch {
            // Mutation error is rendered by the list page.
        }
    }

    return (
        <AdminListPage
            title="Користувачі"
            totalCount={data?.totalCount}
            createHref="/admin/users/create"
            createLabel="Додати користувача"
            search={controls.search}
            searchPlaceholder="Ім'я, пошта або display name"
            onSearchChange={controls.setSearch}
            sortMode={controls.sortMode}
            sortOptions={sortOptions}
            onSortChange={controls.setSortMode}
            error={error ?? deleteState.error}
            isLoading={isLoading}
            isFetching={isFetching}
            isEmpty={users.length === 0}
            loadingTitle="Завантаження користувачів..."
            emptyTitle="Користувачів не знайдено"
            emptySubtitle="Змініть фільтри або створіть нового користувача."
            desktopContent={<UserTable users={users} onDelete={handleDelete} deleteDisabled={deleteState.isLoading} />}
            mobileContent={<UserCards users={users} onDelete={handleDelete} deleteDisabled={deleteState.isLoading} />}
            page={controls.page}
            totalPages={Math.max(data?.totalPages ?? 1, 1)}
            onPageChange={controls.setPage}
        />
    );
}

type UserContentProps = {
    users: PrivateUser[];
    onDelete: (user: PrivateUser) => void;
    deleteDisabled: boolean;
};

function UserTable({ users, onDelete, deleteDisabled }: UserContentProps) {
    return (
        <div className="min-w-[1020px]">
            <div className="sticky top-0 z-10 grid grid-cols-[70px_minmax(280px,1.2fr)_minmax(220px,1fr)_150px_170px_110px] items-center rounded-md bg-[#9a9d9f] px-4 py-2.5 text-[14px] text-white/90 shadow-sm">
                <span>ID</span>
                <span>Користувач</span>
                <span>Email</span>
                <span>Роль</span>
                <span>Створено</span>
                <span className="text-right">Дії</span>
            </div>
            {users.map((user) => (
                <div
                    key={user.id}
                    className="grid grid-cols-[70px_minmax(280px,1.2fr)_minmax(220px,1fr)_150px_170px_110px] items-center border-b border-white/[0.10] px-4 py-3 text-[14px] text-white/75 last:border-b-0 hover:bg-white/[0.018]"
                >
                    <span className="text-white/50">#{user.id}</span>
                    <UserIdentity user={user} />
                    <span className="truncate pr-4 text-white/58">
                        {user.email}
                    </span>
                    <span className="text-white/58">{roleLabels[user.role]}</span>
                    <span className="text-white/52">
                        {formatDate(user.createdAt)}
                    </span>
                    <UserActions user={user} onDelete={onDelete} deleteDisabled={deleteDisabled} />
                </div>
            ))}
        </div>
    );
}

function UserCards({ users, onDelete, deleteDisabled }: UserContentProps) {
    return users.map((user) => (
        <article
            key={user.id}
            className="rounded-lg border border-white/[0.06] bg-white/[0.018] p-3.5"
        >
            <div className="flex min-w-0 items-start gap-3">
                <UserAvatar user={user} />
                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[16px] text-white/90">
                        {user.displayName || user.username}
                    </h2>
                    <p className="mt-0.5 truncate text-[13px] text-white/38">
                        @{user.username}
                    </p>
                    <p className="mt-2 break-all text-[13px] text-white/55">
                        {user.email}
                    </p>
                    <p className="mt-1 text-[12px] text-white/35">
                        {roleLabels[user.role]} · #{user.id}
                    </p>
                </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.05] pt-3">
                <span className="min-w-0 truncate text-[12px] text-white/35">
                    {formatDate(user.createdAt)}
                </span>
                <UserActions user={user} onDelete={onDelete} deleteDisabled={deleteDisabled} />
            </div>
        </article>
    ));
}

function UserIdentity({ user }: { user: PrivateUser }) {
    return (
        <div className="flex min-w-0 items-center gap-3 pr-4">
            <UserAvatar user={user} />
            <div className="min-w-0">
                <p className="truncate text-[16px] text-white/90">
                    {user.displayName || user.username}
                </p>
                <p className="mt-0.5 truncate text-[13px] text-white/35">
                    @{user.username}
                </p>
            </div>
        </div>
    );
}

function UserAvatar({ user }: { user: PrivateUser }) {
    return (
        <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.07] bg-white/[0.035] text-white/30">
            {user.avatar ? (
                <Image
                    src={`/uploads/${encodeURIComponent(user.avatar.path)}`}
                    alt={user.username}
                    fill
                    unoptimized
                    sizes="40px"
                    className="object-cover"
                />
            ) : (
                <UserRound size={19} strokeWidth={1.7} />
            )}
        </div>
    );
}

function UserActions({
    user,
    onDelete,
    deleteDisabled,
}: {
    user: PrivateUser;
    onDelete: (user: PrivateUser) => void;
    deleteDisabled: boolean;
}) {
    return (
        <EntityActions
            editHref={`/admin/users/${user.id}`}
            editLabel={`Редагувати ${user.username}`}
            deleteLabel={`Видалити ${user.username}`}
            onDelete={() => onDelete(user)}
            deleteDisabled={deleteDisabled}
        />
    );
}
