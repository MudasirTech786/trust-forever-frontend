"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { resolvePublicImageUrl } from "@/services/rolesPermissions";

type Props = Omit<ImageProps, "src" | "onError"> & {
  src?: string | null;
};

export default function ProfilePhoto({ src, ...imageProps }: Props) {
  const source = resolvePublicImageUrl(src);

  return <PhotoImage key={source} source={source} {...imageProps} />;
}

function PhotoImage({ source, alt, ...imageProps }: Omit<Props, "src"> & { source: string }) {
  const fallbackSource = resolvePublicImageUrl(null);
  const [showFallback, setShowFallback] = useState(false);
  const [fallbackUnavailable, setFallbackUnavailable] = useState(false);

  if (fallbackUnavailable) {
    return <span aria-label={alt} role="img" className="absolute inset-0 flex items-center justify-center bg-[#FBF8EF] text-2xl font-semibold text-[#9A7625]">
      {alt.trim().slice(0, 1).toUpperCase() || "?"}
    </span>;
  }

  return <Image
    {...imageProps}
    src={showFallback ? fallbackSource : source}
    alt={alt}
    unoptimized
    onError={() => {
      if (showFallback || source === fallbackSource) {
        setFallbackUnavailable(true);
      } else {
        setShowFallback(true);
      }
    }}
  />;
}
