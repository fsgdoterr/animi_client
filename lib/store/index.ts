import { animiApi } from "@/lib/store/api/animi";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
    reducer: {
        [animiApi.reducerPath]: animiApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(animiApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
