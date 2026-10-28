"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useConfirm, useToast } from "@/components/ToastProvider";
import {
  ApiError,
  deleteProfile,
  getProfile,
  type MatrimonialProfile,
} from "@/services/rolesPermissions";
import ProfilePhoto from "@/components/ProfilePhoto";

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#E8E0D0] bg-white p-5 shadow-[0_2px_8px_rgba(23,32,51,0.035)] sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-[#0B2A4A]">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-[#94A3B8]">{label}</p>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[#334155]">
        {value === null || value === undefined || value === "" ? "—" : value}
      </p>
    </div>
  );
}

export default function ProfileDetailsPage() {
  const { id: rawId } = useParams<{ id: string }>();
  const id = Number(rawId);
  const router = useRouter();
  const { permissions } = useAuth();
  const { notify } = useToast();
  const requestConfirmation = useConfirm();
  const [profile, setProfile] = useState<MatrimonialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const canView = permissions.includes("profiles.view");
  const canEdit = permissions.includes("profiles.edit");
  const canDelete = permissions.includes("profiles.delete");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getProfile(id);
      setProfile(result.profile);
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : "Unable to load this profile.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!canView || !Number.isInteger(id) || id < 1) return;
    const timeoutId = window.setTimeout(() => {
      void loadProfile();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [canView, id, loadProfile]);

  function confirmDelete(): void {
    if (!profile) return;
    requestConfirmation({
      title: "Delete Profile?",
      message: `Are you sure you want to delete ${profile.name}’s matrimonial profile? This action cannot be undone.`,
      confirmLabel: "Delete Profile",
      pendingLabel: "Deleting…",
      cancelLabel: "Cancel",
      destructive: true,
      onConfirm: async () => {
        await deleteProfile(profile.id);
        notify({
          variant: "success",
          title: "Profile deleted",
          message: `${profile.name}’s profile has been removed.`,
        });
        router.push("/dashboard/profiles");
      },
      onError: () =>
        notify({
          variant: "error",
          title: "Unable to delete profile",
          message: "Please try again.",
        }),
    });
  }

  if (!canView)
    return (
      <p className="rounded-lg border border-[#E5E7EB] bg-white p-6 text-sm text-[#64748B]">
        Your account does not have permission to view profiles.
      </p>
    );
  if (loading)
    return (
      <div
        role="status"
        aria-label="Loading profile"
        className="mx-auto h-[34rem] max-w-5xl animate-pulse rounded-lg border border-[#E8E0D0] bg-white"
      />
    );
  if (error || !profile)
    return (
      <section className="rounded-lg border border-[#E8C7C2] bg-white p-6">
        <h1 className="font-semibold text-[#0B2A4A]">Unable to load profile</h1>
        <p className="mt-2 text-sm text-[#64748B]">
          {error || "Profile not found."}
        </p>
        <button
          type="button"
          onClick={() => void loadProfile()}
          className="mt-4 min-h-10 rounded-md bg-[#0B2A4A] px-4 text-sm font-medium text-white"
        >
          Try again
        </button>
      </section>
    );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/profiles"
          className="text-sm font-medium text-[#64748B] hover:text-[#0B2A4A]"
        >
          ← All Profiles
        </Link>
        <div className="flex gap-2">
          {canEdit && (
            <Link
              href={`/dashboard/profiles/${profile.id}/edit`}
              className="inline-flex min-h-10 items-center rounded-md bg-[#0B2A4A] px-4 text-sm font-medium text-white hover:bg-[#123E68]"
            >
              Edit Profile
            </Link>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={confirmDelete}
              className="min-h-10 rounded-md border border-[#E8C7C2] px-4 text-sm font-medium text-[#8F3028] hover:bg-[#FBF0EE]"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <header className="flex flex-col gap-5 rounded-lg border border-[#E8E0D0] bg-white p-5 shadow-[0_2px_8px_rgba(23,32,51,0.035)] sm:flex-row sm:items-center sm:p-7">
        <div className="relative size-32 shrink-0 sm:size-40">
          <div className="absolute inset-0 overflow-hidden rounded-lg border border-[#E8E0D0] bg-[#FBF8EF]">
            <ProfilePhoto
              src={profile.profile_picture_url}
              alt={profile.name || "Matrimonial profile"}
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
          <span className="absolute left-0 top-0 z-20 -translate-x-[18%] -translate-y-[18%] whitespace-nowrap rounded-md rounded-br-xl border border-[#D8C99F] bg-[#0B2A4A]/95 px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.06em] text-white shadow-[0_3px_8px_rgba(11,42,74,0.2)] backdrop-blur-sm sm:px-3 sm:text-xs">
            {profile.profile_id}
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A7625]">
            Matrimonial Profile
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#0B2A4A] sm:text-3xl">
            {profile.name}
          </h1>
          <p className="mt-1 text-sm font-semibold text-[#9A7625]">
            Profile ID: <span className="select-all">{profile.profile_id}</span>
          </p>
          <p className="mt-2 text-sm capitalize text-[#475569]">
            {profile.gender} <span aria-hidden="true">·</span>{" "}
            {profile.marital_status}
          </p>
          <p className="mt-1 text-sm text-[#64748B]">
            {[profile.city, `${profile.age} years`, profile.height]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="mt-2 text-sm text-[#64748B]">
            {profile.qualification || "Education not provided"}
            {profile.employed === null
              ? ""
              : ` · ${profile.employed ? "Employed" : "Not employed"}`}
          </p>
        </div>
      </header>
      <DetailSection title="Personal Information">
        <Detail
          label="Gender"
          value={
            profile.gender
              ? profile.gender[0].toUpperCase() + profile.gender.slice(1)
              : null
          }
        />
        <Detail
          label="Marital Status"
          value={
            profile.marital_status
              ? profile.marital_status[0].toUpperCase() +
                profile.marital_status.slice(1)
              : null
          }
        />
        <Detail
          label="Age"
          value={profile.age === null ? null : `${profile.age} years`}
        />
        <Detail label="Height" value={profile.height} />
        <Detail label="Sect" value={profile.sect} />
        <Detail label="Caste" value={profile.caste} />
        <Detail label="Language" value={profile.language} />
        <Detail label="Qualification" value={profile.qualification} />
        <Detail
          label="Educational Institution"
          value={profile.educational_institution}
        />
        <Detail
          label="Employment"
          value={
            profile.employed === null
              ? null
              : profile.employed
                ? "Employed"
                : "Not employed"
          }
        />
        <Detail label="Job" value={profile.job} />
        <Detail label="Business" value={profile.business} />
        <Detail label="Income" value={profile.income} />
      </DetailSection>
      <DetailSection title="Family Details">
        <Detail label="Father's Name" value={profile.father_name} />
        <Detail label="Father Occupation" value={profile.father_occupation} />
        <Detail
          label="Existing Father Details"
          value={profile.father_details}
        />
        <Detail label="Mother" value={profile.mother_details} />
        <Detail label="House Size" value={profile.house_size} />
        <Detail label="Society" value={profile.society} />
        <Detail label="City" value={profile.city} />
        <Detail label="Sisters" value={profile.sisters_count} />
        <Detail label="Sisters Details" value={profile.sisters_details} />
        <Detail label="Married Sisters" value={profile.married_sisters_count} />
        <Detail label="Brothers" value={profile.brothers_count} />
        <Detail label="Brothers Details" value={profile.brothers_details} />
        <Detail
          label="Married Brothers"
          value={profile.married_brothers_count}
        />
        <Detail label="Other Details" value={profile.other_details} />
      </DetailSection>
      <DetailSection title="Life Partner Requirements">
        <div className="sm:col-span-2">
          <Detail
            label="Partner Requirements"
            value={profile.partner_requirements}
          />
        </div>
      </DetailSection>
      <DetailSection title="Contact Numbers">
        <Detail label="WhatsApp Number" value={profile.whatsapp_number} />
        <Detail
          label="Parents WhatsApp Number"
          value={profile.parents_whatsapp}
        />
        <Detail label="Father’s WhatsApp" value={profile.father_whatsapp} />
        <Detail label="Mother’s WhatsApp" value={profile.mother_whatsapp} />
      </DetailSection>
    </div>
  );
}
