"use client";

import Link from "next/link";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { ApiError, updateCurrentProfile } from "@/services/rolesPermissions";
import ProfilePhoto from "@/components/ProfilePhoto";

const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const acceptedImageExtensions = /\.(jpe?g|png|webp)$/i;
const maximumImageSize = 2 * 1024 * 1024;

function friendlyError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Your session has expired. Sign in again to continue.";
    if (error.status === 403) return "You are not allowed to update this profile.";
    if (error.status === 422) return error.message;
  }

  return "Your profile could not be updated. Please try again.";
}

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const { notify } = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [picture, setPicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handlePictureChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.currentTarget.files?.[0];

    if (!file) return;

    const hasAcceptedType = acceptedImageTypes.includes(file.type)
      || (!file.type && acceptedImageExtensions.test(file.name));

    if (!hasAcceptedType || !acceptedImageExtensions.test(file.name)) {
      setPicture(null);
      setPreviewUrl(null);
      event.currentTarget.value = "";
      notify({
        variant: "warning",
        title: "Unsupported profile picture",
        message: "Choose a JPG, JPEG, PNG, or WebP image.",
      });
      return;
    }

    if (file.size > maximumImageSize) {
      setPicture(null);
      setPreviewUrl(null);
      event.currentTarget.value = "";
      notify({
        variant: "warning",
        title: "Profile picture is too large",
        message: "Choose an image that is 2MB or smaller.",
      });
      return;
    }

    setPicture(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      notify({ variant: "warning", title: "Name required", message: "Please enter your name." });
      return;
    }

    setIsSaving(true);
    const includesPicture = picture !== null;

    try {
      const formData = new FormData();
      formData.append("name", trimmedName);
      if (picture) {
        formData.append("profile_picture", picture);
      }

      const response = await updateCurrentProfile(formData);
      updateUser(response.user);
      setName(response.user.name);
      setPicture(null);
      setPreviewUrl(null);
      notify({
        variant: "success",
        title: includesPicture ? "Profile picture updated" : "Profile updated",
        message: includesPicture
          ? "Your profile details and picture have been saved."
          : "Your name has been saved.",
      });
    } catch (updateError) {
      console.error("Unable to update administrator profile", updateError);
      notify({
        variant: "error",
        title: "Unable to update profile",
        message: friendlyError(updateError),
      });
    } finally {
      setIsSaving(false);
    }
  }

  const displayedPicture = previewUrl ?? user?.profile_picture_url ?? null;

  return (
    <div className="mx-auto flex min-h-[min(70vh,720px)] w-full max-w-3xl items-center justify-center">
      <section className="relative w-full overflow-hidden border border-[#E8E0D0] bg-white px-6 py-12 shadow-[0_8px_32px_rgba(23,32,51,0.06)] sm:px-12 sm:py-16">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0B2A4A] via-[#C89B2C] to-[#0B2A4A]" />
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-[#E8E0D0] bg-[#FBF8EF] text-[#9A7625]">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-7">
            <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5.5 20a6.5 6.5 0 0 1 13 0m-1-12.5 2-2m-1.5 3.5 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="mt-6 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[#9A7625]">Administrator settings</p>
        <h1 className="mt-2 text-center text-2xl font-semibold text-[#0B2A4A] sm:text-3xl">Edit your profile</h1>
        <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-6 text-[#64748B] sm:text-base">
          Update your administrator name and profile picture.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-xl space-y-6">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-[#334155]">Name</label>
            <input
              id="profile-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              maxLength={255}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1.5 min-h-11 w-full rounded-md border border-[#CBD5E1] bg-white px-3.5 text-sm text-[#172033] outline-none transition placeholder:text-[#94A3B8] focus:border-[#A47D25] focus:ring-2 focus:ring-[#C89B2C]/15"
            />
          </div>

          <div>
            <p className="block text-sm font-medium text-[#334155]">Profile Picture</p>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E8E0D0] bg-[#FBF8EF] text-[#9A7625]">
                <ProfilePhoto src={displayedPicture} alt="Profile picture preview" fill sizes="96px" className="object-cover" />
              </div>
              <div>
                <label htmlFor="profile-picture" className="inline-flex min-h-10 cursor-pointer items-center rounded-md border border-[#E8E0D0] bg-[#FBF9F4] px-4 text-sm font-medium text-[#0B2A4A] transition hover:border-[#C69A2B]/50 hover:bg-[#F3EBDD]">
                  Choose Image
                </label>
                <input
                  id="profile-picture"
                  name="profile_picture"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handlePictureChange}
                  className="sr-only"
                />
                <p className="mt-2 text-xs text-[#64748B]">JPG, JPEG, PNG, or WebP — maximum 2MB</p>
                {picture && <p className="mt-1 max-w-xs truncate text-xs text-[#64748B]">{picture.name}</p>}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#0B2A4A] px-5 text-sm font-medium text-white transition hover:bg-[#123E68] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C] disabled:cursor-wait disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
            <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[#E8E0D0] bg-[#FBF9F4] px-5 text-sm font-medium text-[#0B2A4A] transition hover:border-[#C69A2B]/50 hover:bg-[#F3EBDD] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C]">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4">
                <path d="m12 4-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to dashboard
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
