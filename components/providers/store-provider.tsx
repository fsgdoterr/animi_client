"use client";

import { useState } from "react";
import { Provider } from "react-redux";

import { makeStore, type AppStore } from "@/lib/store";
import type { PrivateUser } from "@/lib/types/entites/user";

export default function StoreProvider({
    children,
    initialUser,
}: {
    children: React.ReactNode;
    initialUser: PrivateUser | null;
}) {
    const [store] = useState<AppStore>(() => makeStore(initialUser));

    return <Provider store={store}>{children}</Provider>;
}
