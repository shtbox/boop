"use client";

import { Boop } from "@shtbox/boop";

export function BoopClient() {
  return <Boop options={{ endpoint: "https://example.com/feedback", attribution: false }} />;
}
