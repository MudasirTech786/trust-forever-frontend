"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ApiError, listProfileGroups, type ProfileGroup } from "@/services/rolesPermissions";
import GenderChoice, { type ProfileGender } from "@/components/profiles/GenderChoice";

const groupMarks: Record<string, string> = {
  abroad: "INT", islamabad: "ISB", karachi: "KHI", kashmir: "KSH", kpk: "KPK",
  lahore: "LHR", "other-mix-cities": "MIX", "sahiwal-okara-faisalabad": "SOF", "south-punjab": "SP",
};

export default function ProfileGroupsPage() {
  const router = useRouter();
  const { permissions } = useAuth();
  const [groups, setGroups] = useState<ProfileGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setGroups((await listProfileGroups()).groups);
    } catch (loadError) {
      setError(loadError instanceof ApiError ? loadError.message : "Unable to load profile groups.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (permissions.includes("profiles.view")) void loadGroups();
  }, [permissions, loadGroups]);

  if (!permissions.includes("profiles.view")) return <section className="mx-auto max-w-3xl rounded-lg border border-[#E5E7EB] bg-white p-7"><h1 className="text-xl font-semibold text-[#0B2A4A]">Access unavailable</h1><p className="mt-2 text-sm text-[#64748B]">Your account does not have permission to view matrimonial profiles.</p></section>;

  return <div className="mx-auto w-full max-w-[1440px] space-y-6 sm:space-y-8">
    <header className="relative overflow-hidden rounded-2xl border border-[#E9E4D8] bg-[linear-gradient(115deg,#fff_0%,#fff_66%,#FBF8EF_100%)] p-5 shadow-[0_4px_20px_rgba(23,32,51,0.035)] sm:p-7 lg:p-8"><div className="relative max-w-2xl"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A7625]">Explore the collection</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#0B2A4A] sm:text-4xl">Profile Groups</h1><p className="mt-3 text-sm leading-6 text-[#64748B] sm:text-base">Browse verified matrimonial profiles by region. Choose a group to explore its categories or jump straight to male and female profiles.</p></div><div aria-hidden="true" className="absolute -right-10 -top-16 hidden size-64 rounded-full border border-[#D8C99F]/40 sm:block"><div className="absolute inset-7 rounded-full border border-[#D8C99F]/40"/><div className="absolute inset-14 rounded-full border border-[#D8C99F]/40"/><span className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C89B2C]/30"/></div></header>
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold text-[#0B2A4A]">Browse by region</h2><p className="mt-1 text-xs text-[#84909E]">Choose a location to discover relevant profiles.</p></div>{!loading && !error && <span className="rounded-full border border-[#E5E0D5] bg-white px-3 py-1.5 text-xs font-medium text-[#64748B]">{groups.length} regions</span>}</div>
    {loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 9 }, (_, index) => <div key={index} className="h-48 animate-pulse rounded-2xl border border-[#E8E0D0] bg-white p-5"><div className="size-11 rounded-xl bg-[#F0EEE8]"/><div className="mt-6 h-4 w-1/2 rounded bg-[#F0EEE8]"/><div className="mt-4 h-3 w-1/3 rounded bg-[#F7F6F2]"/></div>)}</div>
      : error ? <section className="rounded-2xl border border-[#E8C7C2] bg-white p-8 text-center"><p className="text-sm text-[#8F3028]">{error}</p><button type="button" onClick={() => void loadGroups()} className="mt-4 min-h-10 rounded-lg bg-[#0B2A4A] px-4 text-sm font-semibold text-white">Try again</button></section>
        : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{groups.map((group) => <article key={group.slug} className="group relative flex min-h-48 flex-col overflow-hidden rounded-2xl border border-[#E7E2D7] bg-white p-5 shadow-[0_4px_16px_rgba(23,32,51,0.035)] transition duration-200 hover:-translate-y-1 hover:border-[#D8C99F] hover:shadow-[0_14px_30px_rgba(23,32,51,0.09)] sm:p-6"><Link href={`/dashboard/profile-groups/${group.slug}`} aria-label={`Browse ${group.label} categories`} className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C]"/><div className="relative flex items-start justify-between"><span className="pointer-events-none flex size-12 items-center justify-center rounded-xl border border-[#E9E3D5] bg-[#FBF8EF] text-[10px] font-bold tracking-wider text-[#967526]">{groupMarks[group.slug] || "REG"}</span><span className="pointer-events-none rounded-full border border-[#EEF0F2] bg-[#FBFCFC] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#84909E]">Region</span></div><h3 className="pointer-events-none relative mt-5 text-base font-semibold text-[#0B2A4A] sm:text-lg">{group.label}</h3><div className="relative z-10 mt-auto flex flex-wrap items-center justify-between gap-3 pt-4"><p className="pointer-events-none text-xs text-[#64748B]"><span className="mr-1 text-xl font-semibold tabular-nums text-[#0B2A4A]">{group.count.toLocaleString()}</span>profiles</p><div className="transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"><GenderChoice label={`${group.label} gender`} onSelect={(gender: ProfileGender) => { router.push(`/dashboard/profile-groups/${group.slug}/all-profiles?gender=${gender}`); }} /></div></div></article>)}</div>}
  </div>;
}
