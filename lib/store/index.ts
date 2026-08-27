import { configureStore } from "@reduxjs/toolkit";

import authReducer, { setUser } from "@/lib/store/animi/auth-slice";
import { animiApi } from "@/lib/store/api/animi";
import type { PrivateUser } from "@/lib/types/entites/user";

export const makeStore = (user: PrivateUser | null = null) => {
    const store = configureStore({
        reducer: {
            auth: authReducer,
            [animiApi.reducerPath]: animiApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(animiApi.middleware),
    });

    store.dispatch(setUser(user));

    return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
