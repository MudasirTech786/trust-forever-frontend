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
import ProfilePhotoDownloadButton from "@/components/profiles/ProfilePhotoDownloadButton";
import { formatMatrimonialProfileDetails } from "@/lib/shareMatrimonialProfile";

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#E8E0D0] bg-white p-4 shadow-[0_2px_8px_rgba(23,32,51,0.035)] sm:p-6">
      <h2 className="mb-4 border-b border-[#F0ECE3] pb-2 text-base font-semibold text-[#0B2A4A]">{title}</h2>
      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">{children}</div>
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
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-[#94A3B8]">{label}</p>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[#334155]">
        {value === null || value === undefined || value === "" ? "—" : value}
      </p>
    </div>
  );
}

function plainTextProfile(profile: MatrimonialProfile): string {
  const value = (label: string, content: string | number | null | undefined) =>
    content === null || content === undefined || content === "" ? null : `${label}: ${content}`;
  const sections = [
    ["*Personal information* 📝", [
      value("Gender", profile.gender ? profile.gender[0].toUpperCase() + profile.gender.slice(1) : null),
      value("Marital Status", profile.marital_status ? profile.marital_status[0].toUpperCase() + profile.marital_status.slice(1) : null),
      value("Name", profile.name),
      value("Age", profile.age === null ? null : `${profile.age} years`),
      value("Height", profile.height),
      value("Sect", profile.sect),
      value("Caste", profile.caste),
      value("Language", profile.language),
      value("Qualifications", profile.qualification),
      value("Name of educational institution", profile.educational_institution),
      value("Job", profile.job),
      value("Business", profile.business),
      value("Income if the profile is male", profile.income),
      value("Employment", profile.employed === null ? null : profile.employed ? "Employed" : "Not employed"),
      value("Father details", profile.father_details),
      value("Mother details", profile.mother_details),
      value("Size of house", profile.house_size),
      value("Society", profile.society),
      value("City", profile.city),
    ]],
    ["*Family details* 👨‍👩‍👧", [
      value("Father Name", profile.father_name),
      value("Father occupation", profile.father_occupation),
      value("Mother", profile.mother_details),
      value("Sisters", profile.sisters_count),
      value("Sisters details", profile.sisters_details),
      value("Married sis", profile.married_sisters_count),
      value("Brothers", profile.brothers_count),
      value("Brothers details", profile.brothers_details),
      value("Married bro", profile.married_brothers_count),
      value("Other Details", profile.other_details),
    ]],
    ["*Life partner Requirements* ❓", [value("", profile.partner_requirements)]],
    ["*Contact Numbers* 📱", [
      value("WhatsApp Number", profile.whatsapp_number),
      value("Parents WhatsApp Number", profile.parents_whatsapp),
      value("Father's WhatsApp", profile.father_whatsapp),
      value("Mother's WhatsApp", profile.mother_whatsapp),
    ]],
  ] as const;

  return [
    `TFMB ${profile.profile_id.replace(/^TFMB\s*#?\s*/i, "")}`,
    "Kindly fill this form for marriage proposal",
    ...sections.flatMap(([title, entries]) => {
      const presentEntries = entries.filter((entry): entry is string => entry !== null && entry !== "");
      return presentEntries.length ? [title, ...presentEntries] : [];
    }),
  ].join("\n\n");
}

function PlainTextProfile({ profile }: { profile: MatrimonialProfile }) {
  const text = plainTextProfile(profile);
  const [heading, ...content] = text.split("\n\n");
  return <div className="space-y-4 text-sm leading-6 text-[#666]">
    <p>{heading}</p>
    <p>{content[0]}</p>
    {content.slice(1).map((block, index) => <p key={`${index}-${block.slice(0, 18)}`} className="whitespace-pre-line">{block}</p>)}
  </div>;
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
  const [copied, setCopied] = useState(false);
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

  async function copyProfileDetails(): Promise<void> {
    if (!profile) return;
    try {
      await navigator.clipboard.writeText(formatMatrimonialProfileDetails(profile));
      setCopied(true);
      notify({ variant: "success", title: "Profile details copied", message: "The profile details are ready to paste." });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      notify({ variant: "error", title: "Unable to copy profile", message: "Please allow clipboard access and try again." });
    }
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
    <div className="mx-auto w-full max-w-5xl space-y-5 px-3 sm:px-0">
      <div className="flex flex-wrap items-center justify-between gap-3 max-sm:hidden">
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
      <div className="space-y-4 border-b border-[#E5E7EB] pb-5 sm:hidden">
        <p className="text-sm text-black">{profile.profile_id.replace(/^TFMB\s*#?\s*/i, "TFMB # ")}</p>
        <div className="relative mx-auto h-[290px] w-[218px] max-w-full">
            <ProfilePhoto
              src={profile.profile_picture_url}
              profileId={profile.id}
              filenamePrefix={profile.profile_id}
              alt={profile.name || "Matrimonial profile"}
              fill
              sizes="218px"
              downloadable={false}
              className="object-cover"
            />
        </div>
        <div className="flex w-full justify-center"><ProfilePhotoDownloadButton profileId={profile.id} filenamePrefix={profile.profile_id} className="inline-flex h-[43px] w-[186px] items-center justify-center gap-2 rounded-md bg-[#0B2A4A] px-3 text-sm font-medium text-white hover:bg-[#123E68] disabled:cursor-wait disabled:opacity-70" /></div>
        <h1 className="pt-1 text-base font-normal uppercase text-black">{[profile.city, profile.gender].filter(Boolean).join(" ") || profile.name}</h1>
        <div className="flex w-full justify-center"><button type="button" onClick={() => void copyProfileDetails()} className="inline-flex h-[43px] w-[209px] items-center justify-center gap-2 rounded-md bg-[#0B2A4A] px-3 text-sm font-medium text-white transition hover:bg-[#123E68] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C]">
          {copied ? "Copied Profile Details" : "Copy Profile Details"}
        </button></div>
        <div className="rounded-md border border-[#E5E7EB] px-3 py-4"><PlainTextProfile profile={profile} /></div>
      </div>
      <header className="hidden flex-col items-center gap-3 rounded-lg border border-[#E8E0D0] bg-white p-4 text-center shadow-[0_2px_8px_rgba(23,32,51,0.035)] sm:flex sm:flex-row sm:items-center sm:gap-5 sm:p-7 sm:text-left">
        <p className="w-full select-all text-sm font-bold tracking-[0.08em] text-[#0B2A4A] sm:hidden">{profile.profile_id}</p>
        <div className="relative h-64 w-full max-w-[16rem] shrink-0 sm:h-40 sm:w-40">
          <div className="absolute inset-0 overflow-hidden rounded-lg border border-[#E8E0D0] bg-[#FBF8EF]">
            <ProfilePhoto
              src={profile.profile_picture_url}
              profileId={profile.id}
              filenamePrefix={profile.profile_id}
              alt={profile.name || "Matrimonial profile"}
              fill
              sizes="160px"
              downloadable={false}
              className="object-contain"
            />
          </div>
        </div>
        <ProfilePhotoDownloadButton profileId={profile.id} filenamePrefix={profile.profile_id} className="inline-flex min-h-11 w-full max-w-[16rem] items-center justify-center gap-2 rounded-md bg-[#0B2A4A] px-4 text-sm font-semibold text-white hover:bg-[#123E68] disabled:cursor-wait disabled:opacity-70 sm:hidden" />
        <ProfilePhotoDownloadButton profileId={profile.id} filenamePrefix={profile.profile_id} className="hidden min-h-10 items-center justify-center gap-2 rounded-md border border-[#CBD5E1] px-3 text-xs font-semibold text-[#334155] hover:bg-[#FBF8EF] disabled:cursor-wait disabled:opacity-70 sm:inline-flex" />
        <div className="min-w-0 w-full">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A7625]">
            Matrimonial Profile
          </p>
          <h1 className="mt-1 text-xl font-bold uppercase tracking-wide text-[#0B2A4A] sm:text-3xl">{[profile.city, profile.gender].filter(Boolean).join(" ") || profile.name}</h1>
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
      <button type="button" onClick={() => void copyProfileDetails()} className="hidden min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#0B2A4A] px-4 text-sm font-semibold text-white transition hover:bg-[#123E68] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C] sm:inline-flex">
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4"><rect x="7" y="6" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M12 6V4.5A1.5 1.5 0 0 0 10.5 3h-6A1.5 1.5 0 0 0 3 4.5v8A1.5 1.5 0 0 0 4.5 14H7" stroke="currentColor" strokeWidth="1.4"/></svg>
        {copied ? "Copied Profile Details" : "Copy Profile Details"}
      </button>
      <div className="hidden sm:block">
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
    </div>
  );
}
