import type { PropsWithChildren } from "react";

import StoreProvider from "@/components/providers/store-provider";
import type { PrivateUser } from "@/lib/types/entites/user";

type Props = PropsWithChildren<{
    initialUser: PrivateUser | null;
}>;

export default function Providers({ children, initialUser }: Props) {
    return (
        <StoreProvider key={initialUser?.id ?? "guest"} initialUser={initialUser}>
            {children}
        </StoreProvider>
    );
}
