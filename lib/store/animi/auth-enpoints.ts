import { animiApi } from "@/lib/store/api/animi";
import { PrivateUser } from "@/lib/types/entites/user";

interface SigninRequest {
    username: string;
    password: string;
}

const animiAuthEndpoints = animiApi.injectEndpoints({
    endpoints: (builder) => ({
        getMe: builder.query<PrivateUser, void>({
            query: () => "/auth/me",
            providesTags: ["Me"],
        }),
        signin: builder.mutation<PrivateUser, SigninRequest>({
            query: (body) => ({
                url: "/auth/signin",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Me"],
        }),
        logout: builder.query<void, void>({
            query: () => "/auth/logout",
            providesTags: ["Me"],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(animiApi.util.resetApiState());
                } catch {}
            },
        }),
    }),
});

export const { useGetMeQuery, useSigninMutation, useLazyLogoutQuery } =
    animiAuthEndpoints;
