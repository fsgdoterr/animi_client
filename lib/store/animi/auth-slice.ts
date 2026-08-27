import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { PrivateUser } from "@/lib/types/entites/user";

interface AuthState {
    user: PrivateUser | null;
}

const initialState: AuthState = {
    user: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<PrivateUser | null>) {
            state.user = action.payload;
        },
    },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
