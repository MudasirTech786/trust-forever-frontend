"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import ProfilePhotoDownloadButton from "@/components/profiles/ProfilePhotoDownloadButton";
import { resolvePublicImageUrl } from "@/services/rolesPermissions";

type Props = Omit<ImageProps, "src" | "onError"> & {
  src?: string | null;
  profileId?: number;
  filenamePrefix?: string;
  downloadable?: boolean;
};

export default function ProfilePhoto({ src, profileId, filenamePrefix, downloadable = true, ...imageProps }: Props) {
  const source = resolvePublicImageUrl(src);
  const fallbackSource = resolvePublicImageUrl(null);

  return <PhotoImage key={source} source={source} fallbackSource={fallbackSource} profileId={profileId} filenamePrefix={filenamePrefix} downloadable={downloadable} {...imageProps} />;
}

function PhotoImage({ source, fallbackSource, profileId, filenamePrefix, downloadable, alt, ...imageProps }: Omit<Props, "src"> & { source: string; fallbackSource: string }) {
  const [showFallback, setShowFallback] = useState(false);
  const [fallbackUnavailable, setFallbackUnavailable] = useState(false);
  const sourcePath = new URL(source, typeof window === "undefined" ? "http://localhost" : window.location.href).pathname.toLowerCase();
  const isDefaultAvatar = source === fallbackSource || sourcePath.endsWith("/matrimonial-profiles/avatar.jpg");

  if (fallbackUnavailable) {
    return <span aria-label={alt} role="img" className="absolute inset-0 flex items-center justify-center bg-[#FBF8EF] text-2xl font-semibold text-[#9A7625]">
      {alt.trim().slice(0, 1).toUpperCase() || "?"}
    </span>;
  }

  return <>
    <Image
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
    />
    {downloadable && !isDefaultAvatar && !showFallback && (profileId || source.startsWith("blob:")) && <ProfilePhotoDownloadButton profileId={profileId} filenamePrefix={filenamePrefix} source={source.startsWith("blob:") ? source : undefined} />}
  </>;
}
