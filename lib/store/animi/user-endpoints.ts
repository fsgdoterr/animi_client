import { animiApi } from "@/lib/store/api/animi";
import { toPaginatedResult } from "@/lib/store/utils/paginated-response";
import type {
    PrivateUser,
    UserListResult,
    UserPayload,
} from "@/lib/types/entites/user";

type UserListParams = {
    search?: string;
    sort?: "new" | "old" | "username";
    page?: number;
    limit?: number;
};


const animiUserEndpoints = animiApi.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query<UserListResult, UserListParams | void>({
            query: (params) => ({
                url: "/user",
                params: {
                    mode: "page",
                    page: params?.page ?? 1,
                    limit: params?.limit ?? 25,
                    search: params?.search || undefined,
                    sort: params?.sort || undefined,
                },
            }),
            transformResponse: (
                response: PrivateUser[],
                meta: { response?: Response } | undefined,
            ) => toPaginatedResult(response, meta, 25),
            providesTags: (result) => [
                { type: "User", id: "LIST" },
                ...(result?.items.map((user) => ({
                    type: "User" as const,
                    id: user.id,
                })) ?? []),
            ],
        }),
        getUser: builder.query<PrivateUser, number>({
            query: (id) => `/user/${id}`,
            providesTags: (_result, _error, id) => [{ type: "User", id }],
        }),
        createUser: builder.mutation<PrivateUser, UserPayload & { password: string }>({
            query: (body) => ({ url: "/user", method: "POST", body }),
            invalidatesTags: [{ type: "User", id: "LIST" }],
        }),
        updateUser: builder.mutation<PrivateUser, { id: number; body: Partial<UserPayload> }>({
            query: ({ id, body }) => ({ url: `/user/${id}`, method: "PATCH", body }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: "User", id },
                { type: "User", id: "LIST" },
                { type: "Me" },
            ],
        }),
        deleteUser: builder.mutation<void, number>({
            query: (id) => ({ url: `/user/${id}`, method: "DELETE" }),
            invalidatesTags: (_result, _error, id) => [
                { type: "User", id },
                { type: "User", id: "LIST" },
                { type: "Me" },
            ],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useGetUserQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
} = animiUserEndpoints;
