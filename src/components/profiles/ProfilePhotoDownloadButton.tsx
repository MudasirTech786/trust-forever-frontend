"use client";

import { useState, type MouseEvent } from "react";
import { ApiError, downloadProfilePhoto } from "@/services/rolesPermissions";

export default function ProfilePhotoDownloadButton({
  profileId,
  filenamePrefix,
  source,
}: {
  profileId?: number;
  filenamePrefix?: string;
  source?: string;
}) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    if (downloading) return;

    setDownloading(true);
    setError("");
    try {
      await downloadProfilePhoto(profileId ?? 0, filenamePrefix || `profile-${profileId ?? "photo"}`, source);
    } catch (downloadError) {
      setError(downloadError instanceof ApiError ? downloadError.message : "Unable to download this profile photo.");
    } finally {
      setDownloading(false);
    }
  }

  return <button
    type="button"
    aria-label={downloading ? "Downloading profile photo" : error || "Download profile photo"}
    title={error || "Download photo"}
    disabled={downloading}
    onClick={(event) => void handleDownload(event)}
    className="absolute right-2 top-2 z-30 inline-flex size-10 items-center justify-center rounded-full border border-white/80 bg-white/95 text-[#173451] shadow-[0_2px_10px_rgba(15,23,42,0.2)] backdrop-blur-sm transition hover:scale-105 hover:bg-white hover:text-[#9A7625] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C] disabled:cursor-wait disabled:opacity-70"
  >
    {downloading ? <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-[18px] animate-spin" stroke="currentColor" strokeWidth="1.8"><path d="M20 12a8 8 0 1 1-2.34-5.66" strokeLinecap="round"/><path d="M20 4v5h-5" strokeLinecap="round" strokeLinejoin="round"/></svg> : <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-[18px]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M5 16v4h14v-4"/></svg>}
    {error && <span className="sr-only" role="status">{error}</span>}
  </button>;
}
