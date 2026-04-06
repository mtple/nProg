"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function FarcasterSDK() {
  useEffect(() => {
    sdk.actions.ready();

    sdk.context.then((context) => {
      const insets = context?.client?.safeAreaInsets;
      if (!insets) return;

      const root = document.documentElement;
      root.style.setProperty("--safe-area-top", `${insets.top}px`);
      root.style.setProperty("--safe-area-bottom", `${insets.bottom}px`);
      root.style.setProperty("--safe-area-left", `${insets.left}px`);
      root.style.setProperty("--safe-area-right", `${insets.right}px`);
    }).catch(() => {
      // Not running in a mini app context — safe area defaults apply
    });
  }, []);

  return null;
}
