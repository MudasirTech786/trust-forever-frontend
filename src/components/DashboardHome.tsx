"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import ProfileActionIcon from "@/components/profiles/ProfileActionIcon";
import ProfilePhoto from "@/components/ProfilePhoto";
import { ApiError, getDashboardProfileSummary, getProfile, type DashboardProfileSummary, type DashboardRecentProfile } from "@/services/rolesPermissions";
import { shareMatrimonialProfile } from "@/lib/shareMatrimonialProfile";

function DashboardSkeleton() {
  return <div role="status" aria-label="Loading dashboard profiles" className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
    <section className="rounded-lg border border-[#E8E0D0] bg-white p-5 sm:p-6"><div className="h-5 w-40 animate-pulse rounded bg-[#EEEAE0]" /><div className="mt-5 grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-64 animate-pulse rounded-lg border border-[#F0ECE3] bg-[#FCFCFA] p-4"><div className="h-28 rounded-md bg-[#EEEAE0]" /><div className="mt-4 h-4 w-3/4 rounded bg-[#EEEAE0]" /><div className="mt-3 h-3 w-1/2 rounded bg-[#EEEAE0]" /></div>)}</div></section>
    <aside className="space-y-5"><section className="h-72 animate-pulse rounded-lg border border-[#E8E0D0] bg-white p-5"><div className="h-5 w-36 rounded bg-[#EEEAE0]" /><div className="mt-6 h-3 rounded bg-[#EEEAE0]" /><div className="mt-7 space-y-5">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-4 rounded bg-[#EEEAE0]" />)}</div></section><section className="h-48 animate-pulse rounded-lg border border-[#E8E0D0] bg-white p-5"><div className="h-5 w-32 rounded bg-[#EEEAE0]" /><div className="mt-5 h-11 rounded bg-[#EEEAE0]" /><div className="mt-3 h-11 rounded bg-[#EEEAE0]" /></section></aside>
  </div>;
}

function ProfileAvatar({ profile }: { profile: DashboardRecentProfile }) {
  return <div className="relative aspect-[2/1]">
    <div className="absolute inset-0 overflow-hidden rounded-t-lg bg-[#FBF8EF]">
      <ProfilePhoto src={profile.profile_picture_url} alt={`${profile.name}'s profile`} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 35vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
    </div>
    <span className="absolute left-0 top-0 z-20 -translate-x-[18%] -translate-y-[18%] whitespace-nowrap rounded-md rounded-br-xl border border-[#D8C99F] bg-[#0B2A4A]/95 px-2.5 py-1.5 text-[11px] font-semibold tracking-[0.06em] text-white shadow-[0_3px_8px_rgba(11,42,74,0.2)] backdrop-blur-sm sm:px-3 sm:text-xs">{profile.profile_id}</span>
  </div>;
}

function RecentProfileCard({ profile, canEdit, onShare }: { profile: DashboardRecentProfile; canEdit: boolean; onShare: (profile: DashboardRecentProfile) => void }) {
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(profile.date_of_birth)
    && !Number.isNaN(new Date(`${profile.date_of_birth}T00:00:00Z`).getTime());
  const age = validDate && Number.isFinite(profile.age) ? profile.age : null;
  const details = [profile.gender ? profile.gender[0].toUpperCase() + profile.gender.slice(1) : null, age === null ? null : `${age} years old`, profile.city].filter(Boolean);

  return <article className="group flex min-w-0 flex-col overflow-visible rounded-lg border border-[#E8E0D0] bg-white shadow-[0_2px_8px_rgba(23,32,51,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-[#D8C99F] hover:shadow-[0_8px_24px_rgba(23,32,51,0.09)]">
    <Link href={`/dashboard/profiles/${profile.id}`} aria-label={`View ${profile.name}'s profile`} className="focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#C89B2C]"><ProfileAvatar profile={profile} /></Link>
    <div className="flex flex-1 flex-col p-4 sm:p-5">
      <Link href={`/dashboard/profiles/${profile.id}`} className="w-fit rounded-sm text-base font-semibold text-[#0B2A4A] hover:text-[#9A7625] focus-visible:outline-2 focus-visible:outline-[#C89B2C]">{profile.name}</Link>
      <p className="mt-0.5 text-xs font-medium text-[#9A7625]">Profile ID: <span className="select-all">{profile.profile_id}</span></p>
      <p className="mt-1 text-sm text-[#64748B]">{details.length ? details.join(" · ") : "Profile details available"}</p>
      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-[#F0ECE3] pt-4 text-sm">
        <div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">Education</p><p className="mt-1 truncate font-medium text-[#334155]">{profile.qualification || "Not provided"}</p></div>
        <div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">Caste</p><p className="mt-1 truncate font-medium text-[#334155]">{profile.caste || profile.sect || "Not provided"}</p></div>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-center gap-2 pt-4">
        <Link href={`/dashboard/profiles/${profile.id}`} aria-label={`View ${profile.name}`} title="View" className="inline-flex size-10 items-center justify-center rounded-md border border-[#CBD5E1] text-[#334155] transition hover:border-[#C89B2C] hover:bg-[#FBF8EF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C]"><ProfileActionIcon action="view" /></Link>
        {canEdit && <Link href={`/dashboard/profiles/${profile.id}/edit`} aria-label={`Edit ${profile.name}`} title="Edit" className="inline-flex size-10 items-center justify-center rounded-md bg-[#0B2A4A] text-white transition hover:bg-[#123E68] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C]"><ProfileActionIcon action="edit" /></Link>}
        <button type="button" onClick={() => onShare(profile)} aria-label={`Share ${profile.name} on WhatsApp`} title="Share on WhatsApp" className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-[#B7D8C2] text-[#176B3A] transition hover:bg-[#EFF8F1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C]"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-[18px]"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.5 0 .15 5.34.15 11.92c0 2.1.55 4.15 1.6 5.96L.05 24l6.27-1.64a11.9 11.9 0 0 0 5.75 1.47h.01c6.57 0 11.92-5.35 11.92-11.92 0-3.19-1.24-6.19-3.48-8.43ZM12.08 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.98.99-3.63-.24-.37a9.88 9.88 0 1 1 8.38 4.61Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.48 1.69.61.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" /></svg></button>
      </div>
    </div>
  </article>;
}

function QuickActionIcon({ name }: { name: "view" | "add" }) {
  return <span className="flex size-11 shrink-0 items-center justify-center rounded-md border border-[#EFE8D5] bg-[#FBF8EF] text-[#9A7625] transition group-hover:border-[#E2D4AE] group-hover:bg-[#F7F0DF]">
    {name === "view" ? <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.6" /></svg> : <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 4.5v15M4.5 12h15" /></svg>}
  </span>;
}

export default function DashboardHome() {
  const { permissions, user } = useAuth();
  const { notify } = useToast();
  const [summary, setSummary] = useState<DashboardProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const canViewProfiles = permissions.includes("profiles.view");
  const canEditProfiles = permissions.includes("profiles.edit");
  const canCreateProfiles = permissions.includes("profiles.create");

  async function shareRecentProfile(profile: DashboardRecentProfile): Promise<void> {
    try {
      const { profile: fullProfile } = await getProfile(profile.id);
      const initiated = await shareMatrimonialProfile(fullProfile);
      if (initiated) notify({ variant: "success", title: "Profile ready to share on WhatsApp", message: "The profile details are ready to send." });
    } catch {
      notify({ variant: "error", title: "Unable to share profile", message: "Please try sharing this profile again." });
    }
  }

  const loadSummary = useCallback(async () => {
    if (!canViewProfiles) return;
    setLoading(true);
    setError("");
    try {
      setSummary(await getDashboardProfileSummary());
    } catch (cause) {
      const message = cause instanceof ApiError ? cause.message : "Unable to load dashboard profile data. Please try again.";
      setError(message);
      notify({ variant: "error", title: "Unable to load dashboard data", message });
    } finally {
      setLoading(false);
    }
  }, [canViewProfiles, notify]);

  useEffect(() => {
    if (!canViewProfiles) return;
    const timeoutId = window.setTimeout(() => { void loadSummary(); }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [canViewProfiles, loadSummary]);

  const formattedDate = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Karachi",
  }).format(new Date());

  const stats = summary?.statistics;
  const total = stats?.total_profiles ?? 0;
  const malePercent = total ? Math.round((stats!.male_profiles / total) * 100) : 0;
  const femalePercent = total ? Math.round((stats!.female_profiles / total) * 100) : 0;

  return <div className="mx-auto w-full max-w-[1440px] space-y-7 font-sans text-[#0F172A]">
    <section className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-sm font-medium text-[#B18421]">Trust Forever Marriage Bureau</p><h1 className="mt-1 text-2xl font-semibold text-[#0B2A4A]">Good morning, {user?.name?.split(" ")[0] || "Admin"}</h1><p className="mt-1 text-sm text-[#64748B]">A clear view of your bureau&apos;s activity and profiles.</p></div>
      <p className="text-xs font-medium text-[#64748B] sm:text-sm">{formattedDate}</p>
    </section>

    {canViewProfiles && loading ? <DashboardSkeleton /> : <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section aria-label="Recent profiles" className="min-w-0 rounded-lg border border-[#E8E0D0] bg-white shadow-[0_2px_8px_rgba(23,32,51,0.035)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0ECE3] px-5 py-4 sm:px-6">
          <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A7625]">Latest registrations</p><h2 className="mt-1 text-base font-semibold text-[#172033]">Recent Profiles</h2></div>
          {canViewProfiles && <Link href="/dashboard/profiles" className="inline-flex min-h-10 items-center gap-2 rounded-md px-2 text-sm font-semibold text-[#0B2A4A] transition hover:bg-[#FBF8EF] hover:text-[#9A7625]">View All Profiles <span aria-hidden="true">→</span></Link>}
        </div>
        {!canViewProfiles ? <div className="m-5 rounded-md border border-[#E8E0D0] bg-[#FCFCFA] px-4 py-8 text-center"><p className="text-sm font-medium text-[#334155]">Profile access is limited</p><p className="mt-1 text-sm text-[#64748B]">Your account does not have permission to view matrimonial profiles.</p></div>
          : error ? <div className="m-5 rounded-md border border-[#E8C7C2] bg-[#FBF0EE] p-5 text-center"><p className="text-sm text-[#8F3028]">Dashboard profile information could not be loaded.</p><button type="button" onClick={() => void loadSummary()} className="mt-3 min-h-10 rounded-md bg-[#0B2A4A] px-4 text-sm font-semibold text-white transition hover:bg-[#123E68]">Try again</button></div>
            : summary?.recent_profiles.length ? <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">{summary.recent_profiles.map((profile) => <RecentProfileCard key={profile.id} profile={profile} canEdit={canEditProfiles} onShare={(item) => void shareRecentProfile(item)} />)}</div>
              : <div className="m-4 flex min-h-64 flex-col items-center justify-center rounded-md border border-dashed border-[#D8D4C9] bg-[#FCFCFA] px-5 py-10 text-center sm:m-5"><span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full border border-[#EFE8D5] bg-[#FBF8EF] text-[#9A7625]"><svg viewBox="0 0 24 24" fill="none" className="size-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0m2-9a3 3 0 1 0 0-6m1 9a5 5 0 0 1 3 4.5" /></svg></span><h3 className="mt-4 text-base font-semibold text-[#0B2A4A]">No profiles yet</h3><p className="mt-1 max-w-sm text-sm leading-6 text-[#64748B]">New matrimonial profiles will appear here after they are added.</p>{canCreateProfiles && <Link href="/dashboard/profiles/new" className="mt-4 inline-flex min-h-10 items-center rounded-md bg-[#0B2A4A] px-4 text-sm font-semibold text-white transition hover:bg-[#123E68]">Add Profile</Link>}</div>}
      </section>

      <aside className="space-y-5">
        <section aria-label="Profile overview" className="rounded-lg border border-[#E8E0D0] bg-white p-5 shadow-[0_2px_8px_rgba(23,32,51,0.035)] sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A7625]">At a glance</p>
          <h2 className="mt-1 text-base font-semibold text-[#172033]">Profile Overview</h2>
          <p className="mt-1 text-xs text-[#64748B]">Distribution across your profile records</p>
          {!canViewProfiles && <p className="mt-5 rounded-md bg-[#FCFCFA] p-4 text-sm leading-6 text-[#64748B]">Profile statistics require permission to view matrimonial profiles.</p>}
          {canViewProfiles && error && <p className="mt-5 rounded-md border border-[#E8C7C2] bg-[#FBF0EE] p-4 text-sm text-[#8F3028]">Statistics are unavailable until the dashboard data loads.</p>}
          {canViewProfiles && !error && stats && <div className="mt-5">
            <div className="flex h-2 overflow-hidden rounded-full bg-[#EEF0F2]" role="img" aria-label={`Male profiles ${malePercent}%, female profiles ${femalePercent}%`}>
              <span className="h-full bg-[#0B2A4A]" style={{ width: `${malePercent}%` }} />
              <span className="h-full bg-[#C89B2C]" style={{ width: `${femalePercent}%` }} />
            </div>
            <dl className="mt-5 space-y-4">
              <div><dt className="sr-only">Total Profiles</dt><dd><Link href="/dashboard/profiles" className="flex items-center justify-between gap-3 rounded-md border border-[#EFE8D5] bg-[#FBF8EF] px-3.5 py-3 transition hover:border-[#D8C99F] hover:bg-[#F7F0DF]"><span className="text-sm font-medium text-[#475569]">Total Profiles</span><span className="text-lg font-semibold tabular-nums text-[#0B2A4A]">{stats.total_profiles.toLocaleString()}</span></Link></dd></div>
              <div className="flex items-center justify-between gap-3 text-sm"><dt className="flex items-center gap-2.5 text-[#475569]"><span aria-hidden="true" className="size-2 rounded-full bg-[#0B2A4A]" />Male</dt><dd className="font-semibold tabular-nums text-[#172033]">{stats.male_profiles.toLocaleString()}</dd></div>
              <div className="flex items-center justify-between gap-3 text-sm"><dt className="flex items-center gap-2.5 text-[#475569]"><span aria-hidden="true" className="size-2 rounded-full bg-[#C89B2C]" />Female</dt><dd className="font-semibold tabular-nums text-[#172033]">{stats.female_profiles.toLocaleString()}</dd></div>
              <div className="border-t border-[#F0ECE3] pt-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[#94A3B8]">Marital status</p>
                <dl className="space-y-3">
                  <div className="flex items-center justify-between gap-3 text-sm"><dt className="text-[#475569]">Unmarried</dt><dd className="font-semibold tabular-nums text-[#172033]">{stats.unmarried_profiles.toLocaleString()}</dd></div>
                  <div className="flex items-center justify-between gap-3 text-sm"><dt className="text-[#475569]">Married</dt><dd className="font-semibold tabular-nums text-[#172033]">{stats.married_profiles.toLocaleString()}</dd></div>
                </dl>
              </div>
            </dl>
          </div>}
        </section>

        <section aria-label="Quick actions" className="rounded-lg border border-[#E8E0D0] bg-white p-5 shadow-[0_2px_8px_rgba(23,32,51,0.035)] sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A7625]">Shortcuts</p><h2 className="mt-1 text-base font-semibold text-[#172033]">Quick Actions</h2><p className="mt-1 text-xs leading-5 text-[#64748B]">Continue working with bureau records.</p>
          <div className="mt-4 space-y-2.5">
            {canViewProfiles && <Link href="/dashboard/profiles" className="group flex min-h-[68px] items-center gap-3 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-3 transition hover:border-[#D8C99F] hover:bg-[#FCFBF7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C]"><QuickActionIcon name="view" /><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#0B2A4A]">View Profiles</span><span className="mt-0.5 block text-xs text-[#64748B]">Browse matrimonial records</span></span><span aria-hidden="true" className="text-lg text-[#B18421] transition-transform group-hover:translate-x-0.5">→</span></Link>}
            {canCreateProfiles && <Link href="/dashboard/profiles/new" className="group flex min-h-[68px] items-center gap-3 rounded-md border border-[#E5E7EB] bg-white px-3.5 py-3 transition hover:border-[#D8C99F] hover:bg-[#FCFBF7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C]"><QuickActionIcon name="add" /><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#0B2A4A]">Add Profile</span><span className="mt-0.5 block text-xs text-[#64748B]">Create a new matrimonial record</span></span><span aria-hidden="true" className="text-lg text-[#B18421] transition-transform group-hover:translate-x-0.5">→</span></Link>}
            {!canViewProfiles && !canCreateProfiles && <p className="rounded-md bg-[#FCFCFA] p-4 text-sm leading-6 text-[#64748B]">There are no profile actions available for your current access.</p>}
          </div>
        </section>
      </aside>
    </div>}
  </div>;
}
