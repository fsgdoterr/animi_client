import StoreProvider from "@/components/providers/store-provider";
import { PropsWithChildren } from "react";

export default function Providers({children}: PropsWithChildren) {
    return(
        <StoreProvider>
            {children}
        </StoreProvider>
    );
}