"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function FarcasterSDK() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return null;
}
