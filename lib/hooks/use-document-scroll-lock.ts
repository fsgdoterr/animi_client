"use client";

import { useEffect } from "react";

let activeLocks = 0;
let previousBodyOverflow = "";

function acquireDocumentScrollLock() {
    if (activeLocks === 0) {
        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
    }

    activeLocks += 1;
}

function releaseDocumentScrollLock() {
    activeLocks = Math.max(0, activeLocks - 1);
    if (activeLocks !== 0) return;

    document.body.style.overflow = previousBodyOverflow;
    previousBodyOverflow = "";
}

export default function useDocumentScrollLock(locked: boolean) {
    useEffect(() => {
        if (!locked) return;

        acquireDocumentScrollLock();
        return releaseDocumentScrollLock;
    }, [locked]);
}
