"use client";

import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import type { Options as OptionsOfCreateCache } from "@emotion/cache";

interface EmotionRegistryProps {
  options: Omit<OptionsOfCreateCache, "insertionPoint">;
  children: React.ReactNode;
}

export function EmotionRegistry({ options, children }: EmotionRegistryProps) {
  const [cache] = useState(() => {
    const cache = createCache(options);
    cache.compat = true;
    return cache;
  });

  useServerInsertedHTML(() => {
    const entries = Object.entries(cache.inserted);
    if (entries.length === 0) {
      return null;
    }

    const names = entries
      .map(([name]) => name)
      .filter((name) => typeof name === "string");

    const styles = entries
      .map(([, value]) => value)
      .filter((style) => typeof style === "string")
      .join("\n");

    const emotionKey = cache.key;

    return (
      <style
        data-emotion={`${emotionKey} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
