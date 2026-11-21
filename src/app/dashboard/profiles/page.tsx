"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useConfirm, useToast } from "@/components/ToastProvider";
import ProfileActionIcon from "@/components/profiles/ProfileActionIcon";
import ProfilePhoto from "@/components/ProfilePhoto";
import ProfileInformationSections from "@/components/profiles/ProfileInformationSections";
import ProfilePhotoDownloadButton from "@/components/profiles/ProfilePhotoDownloadButton";
import { ApiError, deleteProfile, listProfiles, type MatrimonialProfile } from "@/services/rolesPermissions";
import { formatMatrimonialProfileDetails, shareMatrimonialProfile } from "@/lib/shareMatrimonialProfile";

function plainTextProfile(profile: MatrimonialProfile): string {
  const value = (label: string, content: string | number | null | undefined) =>
    content === null || content === undefined || content === "" ? null : label ? `${label}: ${content}` : String(content);
  const sections = [
    ["*Personal information* 📝", [
      value("Gender", profile.gender ? profile.gender[0].toUpperCase() + profile.gender.slice(1) : null),
      value("Marital Status", profile.marital_status ? profile.marital_status[0].toUpperCase() + profile.marital_status.slice(1) : null),
      value("Name", profile.name), value("Age", profile.age === null ? null : `${profile.age} years`),
      value("Height", profile.height), value("Sect", profile.sect), value("Caste", profile.caste),
      value("Language", profile.language), value("Qualifications", profile.qualification),
      value("Name of educational institution", profile.educational_institution),
      value("Job", profile.job), value("Business", profile.business), value("Income if the profile is male", profile.income),
      value("Employment", profile.employed === null ? null : profile.employed ? "Employed" : "Not employed"),
      value("Size of house", profile.house_size), value("Society", profile.society), value("City", profile.city),
    ]],
    ["*Family details* 👨‍👩‍👧", [
      value("Father Name", profile.father_name), value("Father occupation", profile.father_occupation),
      value("Mother", profile.mother_details), value("Sisters", profile.sisters_count),
      value("Sisters details", profile.sisters_details), value("Married sis", profile.married_sisters_count),
      value("Brothers", profile.brothers_count), value("Brothers details", profile.brothers_details),
      value("Married bro", profile.married_brothers_count), value("Other Details", profile.other_details),
    ]],
    ["*Life partner Requirements* ❓", [value("", profile.partner_requirements)]],
    ["*Contact Numbers* 📱", [
      value("WhatsApp Number", profile.whatsapp_number), value("Parents WhatsApp Number", profile.parents_whatsapp),
      value("Father's WhatsApp", profile.father_whatsapp), value("Mother's WhatsApp", profile.mother_whatsapp),
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
  const [heading, intro, ...sections] = plainTextProfile(profile).split("\n\n");
  return <div className="space-y-4 text-left text-sm leading-6 text-[#666]">
    <p>{heading}</p><p>{intro}</p>
    {sections.map((section, index) => <p key={`${index}-${section.slice(0, 18)}`} className="whitespace-pre-line">{section}</p>)}
  </div>;
}

function LoadingCards() {
  return <div className="grid grid-cols-1 gap-5">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-[34rem] animate-pulse rounded-lg border border-[#E8E0D0] bg-white p-5"><div className="flex gap-4"><div className="size-28 rounded-md bg-[#EEEAE0]" /><div className="flex-1 space-y-3 pt-2"><div className="h-4 w-3/4 rounded bg-[#EEEAE0]" /><div className="h-3 w-1/2 rounded bg-[#EEEAE0]" /></div></div><div className="mt-6 space-y-4">{Array.from({ length: 4 }, (_, section) => <div key={section} className="h-24 rounded-md bg-[#EEEAE0]" />)}</div></div>)}</div>;
}

function ProfileCard({ profile, canEdit, canDelete, onDelete, onShare }: { profile: MatrimonialProfile; canEdit: boolean; canDelete: boolean; onDelete: (profile: MatrimonialProfile) => void; onShare: (profile: MatrimonialProfile) => void }) {
  const { notify } = useToast();
  const [copied, setCopied] = useState(false);

  async function copyDetails(): Promise<void> {
    try {
      await navigator.clipboard.writeText(formatMatrimonialProfileDetails(profile));
      setCopied(true);
      notify({ variant: "success", title: "Profile details copied", message: "The profile details are ready to paste." });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      notify({ variant: "error", title: "Unable to copy profile", message: "Please allow clipboard access and try again." });
    }
  }

  return <article className="flex min-w-0 flex-col gap-4 rounded-md border border-[#D9DEE5] bg-white p-4 shadow-none sm:p-5">
    <div className="space-y-4">
      <p className="text-sm text-black">{profile.profile_id.replace(/^TFMB\s*#?\s*/i, "TFMB # ")}</p>
      <div className="relative mx-auto h-[290px] w-[218px] max-w-full">
        <ProfilePhoto src={profile.profile_picture_url} profileId={profile.id} filenamePrefix={profile.profile_id} alt={profile.name || "Matrimonial profile"} fill sizes="218px" downloadable={false} className="object-cover" />
      </div>
      <div className="flex w-full justify-center"><ProfilePhotoDownloadButton profileId={profile.id} filenamePrefix={profile.profile_id} className="inline-flex h-[43px] w-[186px] items-center justify-center gap-2 rounded-md bg-[#0B2A4A] px-3 text-sm font-medium text-white hover:bg-[#123E68] disabled:cursor-wait disabled:opacity-70" /></div>
      <h2 className="pt-1 text-base font-normal uppercase text-black">{[profile.city, profile.gender].filter(Boolean).join(" ") || profile.name || "Profile details"}</h2>
      <div className="flex w-full justify-center"><button type="button" onClick={() => void copyDetails()} className="inline-flex h-[43px] w-[209px] items-center justify-center gap-2 rounded-md bg-[#0B2A4A] px-3 text-sm font-medium text-white transition hover:bg-[#123E68] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C]">{copied ? "Copied Profile Details" : "Copy Profile Details"}</button></div>
      <div className="rounded-md border border-[#E5E7EB] px-3 py-4"><PlainTextProfile profile={profile} /></div>
      <div className="flex flex-wrap items-center gap-2 border-t border-[#eee] pt-3">
        <Link href={`/dashboard/profiles/${profile.id}`} aria-label={`View ${profile.name}`} title="View" className="inline-flex size-10 items-center justify-center rounded-md border border-[#CBD5E1] text-[#334155]"><ProfileActionIcon action="view" /></Link>
        {canEdit && <Link href={`/dashboard/profiles/${profile.id}/edit`} aria-label={`Edit ${profile.name}`} title="Edit" className="inline-flex size-10 items-center justify-center rounded-md bg-[#0B2A4A] text-white"><ProfileActionIcon action="edit" /></Link>}
        <button type="button" onClick={() => onShare(profile)} aria-label={`Share ${profile.name} on WhatsApp`} title="Share on WhatsApp" className="inline-flex size-10 items-center justify-center rounded-md border border-[#B7D8C2] text-[#176B3A]"><span aria-hidden="true">↗</span></button>
        {canDelete && <button type="button" onClick={() => onDelete(profile)} aria-label={`Delete ${profile.name}`} title="Delete" className="inline-flex size-10 items-center justify-center rounded-md border border-[#E8C7C2] text-[#8F3028]"><ProfileActionIcon action="delete" /></button>}
      </div>
    </div>
    <div className="hidden">
    <header className="flex min-w-0 flex-col items-center gap-3 rounded-lg border border-[#E8E0D0] bg-white p-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:p-5 sm:text-left">
      <p className="w-full select-all text-sm font-bold tracking-[0.08em] text-[#0B2A4A] sm:hidden">{profile.profile_id}</p>
      <div className="relative h-64 w-full max-w-[16rem] shrink-0 sm:h-40 sm:w-40">
        <div className="absolute inset-0 overflow-hidden rounded-lg border border-[#E8E0D0] bg-[#FBF8EF]">
          <ProfilePhoto src={profile.profile_picture_url} profileId={profile.id} filenamePrefix={profile.profile_id} alt={profile.name || "Matrimonial profile"} fill sizes="160px" downloadable={false} className="object-contain" />
        </div>
      </div>
      <div className="min-w-0 w-full">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A7625]">Matrimonial Profile</p>
        <h2 className="mt-1 break-words text-xl font-bold uppercase tracking-wide text-[#0B2A4A] sm:text-2xl">{[profile.city, profile.gender].filter(Boolean).join(" ") || profile.name || "Profile details"}</h2>
        <p className="mt-1 text-sm font-semibold text-[#9A7625]">Profile ID: <span className="select-all">{profile.profile_id}</span></p>
        <p className="mt-2 text-sm capitalize text-[#475569]">{profile.gender} <span aria-hidden="true">·</span> {profile.marital_status}</p>
        <p className="mt-1 text-sm text-[#64748B]">{[profile.city, profile.age === null ? null : `${profile.age} years`, profile.height].filter(Boolean).join(" · ")}</p>
        <p className="mt-2 text-sm text-[#64748B]">{profile.qualification || "Education not provided"}{profile.employed === null ? "" : ` · ${profile.employed ? "Employed" : "Not employed"}`}</p>
      </div>
    </header>
    <ProfileInformationSections profile={profile} />
    <div className="flex flex-wrap items-center justify-center gap-2 border-t border-[#F0ECE3] pt-4">
      <button type="button" onClick={() => void copyDetails()} className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#CBD5E1] px-4 text-sm font-medium text-[#334155] transition hover:bg-[#F7F7F5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C]">{copied ? "Copied" : "Copy Details"}</button>
      <Link href={`/dashboard/profiles/${profile.id}`} aria-label={`View ${profile.name}`} title="View" className="inline-flex size-10 items-center justify-center rounded-md border border-[#CBD5E1] text-[#334155] transition hover:bg-[#F7F7F5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C]"><ProfileActionIcon action="view" /></Link>
      {canEdit && <Link href={`/dashboard/profiles/${profile.id}/edit`} aria-label={`Edit ${profile.name}`} title="Edit" className="inline-flex size-10 items-center justify-center rounded-md bg-[#0B2A4A] text-white transition hover:bg-[#123E68] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C]"><ProfileActionIcon action="edit" /></Link>}
      <button type="button" onClick={() => onShare(profile)} aria-label={`Share ${profile.name} on WhatsApp`} title="Share on WhatsApp" className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-[#B7D8C2] text-[#176B3A] transition hover:bg-[#EFF8F1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C]"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-[18px]"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.5 0 .15 5.34.15 11.92c0 2.1.55 4.15 1.6 5.96L.05 24l6.27-1.64a11.9 11.9 0 0 0 5.75 1.47h.01c6.57 0 11.92-5.35 11.92-11.92 0-3.19-1.24-6.19-3.48-8.43ZM12.08 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.98.99-3.63-.24-.37a9.88 9.88 0 1 1 8.38 4.61Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.48 1.69.61.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" /></svg></button>
      {canDelete && <button type="button" onClick={() => onDelete(profile)} aria-label={`Delete ${profile.name}`} title="Delete" className="inline-flex size-10 items-center justify-center rounded-md border border-[#E8C7C2] text-[#8F3028] transition hover:bg-[#FBF0EE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C]"><ProfileActionIcon action="delete" /></button>}
    </div>
    </div>
  </article>;
}

export default function ProfilesPage() {
  const { permissions } = useAuth();
  const { notify } = useToast();
  const requestConfirmation = useConfirm();
  const [profiles, setProfiles] = useState<MatrimonialProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [employed, setEmployed] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const perPage = 24;
  const canView = permissions.includes("profiles.view");
  const canCreate = permissions.includes("profiles.create");
  const canEdit = permissions.includes("profiles.edit");
  const canDelete = permissions.includes("profiles.delete");

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listProfiles({
        search: search.trim(),
        gender: gender as "male" | "female" | undefined,
        marital_status: maritalStatus as MatrimonialProfile["marital_status"] | undefined,
        employed: employed as "true" | "false" | undefined,
        page,
        per_page: perPage,
      });
      setProfiles(result.profiles);
      setTotal(result.total);
    } catch (loadError) {
      const message = loadError instanceof ApiError ? loadError.message : "Unable to load profiles. Please try again.";
      setError(message);
      notify({ variant: "error", title: "Unable to load profiles", message });
    } finally {
      setLoading(false);
    }
  }, [notify, search, gender, maritalStatus, employed, page]);

  useEffect(() => {
    if (!canView) return;
    const timeoutId = window.setTimeout(() => { void loadProfiles(); }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [canView, loadProfiles]);

  const filtered = profiles;
  const lastPage = Math.max(1, Math.ceil(total / perPage));

  function confirmDelete(profile: MatrimonialProfile): void {
    requestConfirmation({
      title: "Delete Profile?",
      message: `Are you sure you want to delete ${profile.name}’s matrimonial profile? This action cannot be undone.`,
      confirmLabel: "Delete Profile",
      pendingLabel: "Deleting…",
      cancelLabel: "Cancel",
      destructive: true,
      onConfirm: async () => {
        await deleteProfile(profile.id);
        setProfiles((current) => current.filter((item) => item.id !== profile.id));
        setTotal((current) => Math.max(0, current - 1));
        notify({ variant: "success", title: "Profile deleted", message: `${profile.name}’s profile has been removed.` });
      },
      onError: () => notify({ variant: "error", title: "Unable to delete profile", message: "Please try again." }),
    });
  }

  async function shareProfile(profile: MatrimonialProfile): Promise<void> {
    try {
      const initiated = await shareMatrimonialProfile(profile);
      if (initiated) notify({ variant: "success", title: "Profile ready to share on WhatsApp", message: "The profile details are ready to send." });
    } catch {
      notify({ variant: "error", title: "Unable to open WhatsApp", message: "Please try sharing this profile again." });
    }
  }

  if (!canView) return <section className="mx-auto max-w-3xl rounded-lg border border-[#E5E7EB] bg-white p-7"><h1 className="text-xl font-semibold text-[#0B2A4A]">Access unavailable</h1><p className="mt-2 text-sm text-[#64748B]">Your account does not have permission to view matrimonial profiles.</p></section>;

  return <div className="mx-auto w-full max-w-7xl space-y-6">
    {showMaintenance && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowMaintenance(false)}><section role="alertdialog" aria-modal="true" aria-labelledby="maintenance-title" className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}><h2 id="maintenance-title" className="text-lg font-semibold text-[#0B2A4A]">Maintenance underway</h2><p className="mt-2 text-sm leading-6 text-[#64748B]">This feature is currently under maintenance. Please wait.</p><button type="button" onClick={() => setShowMaintenance(false)} className="mt-5 min-h-10 rounded-md bg-[#0B2A4A] px-4 text-sm font-medium text-white">Close</button></section></div>}
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A7625]">Marriage bureau records</p><h1 className="mt-1 text-2xl font-semibold text-[#0B2A4A] sm:text-3xl">Matrimonial Profiles</h1><p className="mt-2 text-sm text-[#64748B]">Manage and organize matrimonial profiles.</p></div>
      {canCreate && <button type="button" onClick={() => setShowMaintenance(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#0B2A4A] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123E68]"><span aria-hidden="true" className="text-lg leading-none">+</span>Add New Profile</button>}
    </div>

    <section className="rounded-lg border border-[#E8E0D0] bg-white p-4 shadow-[0_2px_8px_rgba(23,32,51,0.035)] sm:p-5" aria-label="Search and filter profiles">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <label className="block text-xs font-medium text-[#64748B] xl:col-span-2">Search profiles<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, city, caste, qualification" className="mt-1.5 min-h-10 w-full rounded-md border border-[#CBD5E1] px-3 text-sm text-[#172033] outline-none focus:border-[#C89B2C] focus:ring-2 focus:ring-[#C89B2C]/15" /></label>
        {[["Gender", gender, setGender, [["female", "Female"], ["male", "Male"]]], ["Marital status", maritalStatus, setMaritalStatus, [["unmarried", "Unmarried"], ["married", "Married"], ["divorced", "Divorced"], ["widowed", "Widowed"]]]].map(([label, value, setter, options]) => <label key={label as string} className="block text-xs font-medium text-[#64748B]">{label as string}<select value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className="mt-1.5 min-h-10 w-full rounded-md border border-[#CBD5E1] bg-white px-2 text-sm text-[#172033] outline-none focus:border-[#C89B2C]"><option value="">All</option>{(options as string[][]).map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>)}
      </div>
      <p className="mt-3 text-xs text-[#94A3B8]">Showing {filtered.length} of {total} profiles</p>
    </section>

    {loading ? <LoadingCards /> : error ? <section className="rounded-lg border border-[#E8C7C2] bg-white p-8 text-center"><p className="text-sm text-[#8F3028]">Unable to load profiles. Please try again.</p><button type="button" onClick={() => void loadProfiles()} className="mt-4 min-h-10 rounded-md bg-[#0B2A4A] px-4 text-sm font-medium text-white">Try again</button></section>
      : profiles.length === 0 ? <section className="rounded-lg border border-[#E8E0D0] bg-white px-6 py-14 text-center shadow-[0_2px_8px_rgba(23,32,51,0.035)]"><div aria-hidden="true" className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#FBF8EF] text-[#9A7625]"><svg viewBox="0 0 24 24" fill="none" className="size-7"><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0m2-9a3 3 0 1 0 0-6m1 9a5 5 0 0 1 3 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></div><h2 className="mt-4 text-lg font-semibold text-[#0B2A4A]">{total === 0 ? "No matrimonial profiles yet" : "No matching profiles"}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">{total === 0 ? "Create your first profile to start managing your matrimonial records." : "Try adjusting your search or filters."}</p>{canCreate && total === 0 && <button type="button" onClick={() => setShowMaintenance(true)} className="mt-5 inline-flex min-h-11 items-center rounded-md bg-[#0B2A4A] px-5 text-sm font-semibold text-white hover:bg-[#123E68]">Add New Profile</button>}</section>
        : filtered.length === 0 ? <section className="rounded-lg border border-[#E8E0D0] bg-white p-12 text-center"><h2 className="font-semibold text-[#0B2A4A]">No matching profiles</h2><p className="mt-2 text-sm text-[#64748B]">Try adjusting your search or filters.</p></section>
          : <><div className="grid grid-cols-1 gap-5">{filtered.map((profile) => <ProfileCard key={profile.id} profile={profile} canEdit={canEdit} canDelete={canDelete} onDelete={confirmDelete} onShare={(item) => void shareProfile(item)} />)}</div><div className="flex items-center justify-between rounded-lg border border-[#E8E0D0] bg-white px-4 py-3 text-sm"><span className="text-[#64748B]">Page {page} of {lastPage}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="min-h-9 rounded-md border border-[#CBD5E1] px-3 font-medium text-[#334155] disabled:opacity-40">Previous</button><button type="button" disabled={page >= lastPage} onClick={() => setPage((current) => Math.min(lastPage, current + 1))} className="min-h-9 rounded-md border border-[#CBD5E1] px-3 font-medium text-[#334155] disabled:opacity-40">Next</button></div></div></>}
  </div>;
}
