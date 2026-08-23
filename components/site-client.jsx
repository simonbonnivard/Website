"use client";

import { useEffect } from "react";
import { initSite } from "@/lib/site-init";

export default function SiteClient() {
  useEffect(() => {
    const cleanup = initSite();
    return () => cleanup?.();
  }, []);

  return null;
}
