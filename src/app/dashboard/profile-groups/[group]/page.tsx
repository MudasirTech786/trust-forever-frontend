"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ApiError, listProfileGroupCategories, type ProfileGroup } from "@/services/rolesPermissions";
import GenderChoice, { type ProfileGender } from "@/components/profiles/GenderChoice";

export default function ProfileGroupPage() {
  const { permissions } = useAuth();
  const router = useRouter();
  const params = useParams<{ group: string }>();
  const group = params.group;
  const [categories, setCategories] = useState<ProfileGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCategories((await listProfileGroupCategories(group)).categories);
    } catch (loadError) {
      setError(loadError instanceof ApiError ? loadError.message : "Unable to load categories.");
    } finally {
      setLoading(false);
    }
  }, [group]);

  useEffect(() => {
    if (permissions.includes("profiles.view")) void loadCategories();
  }, [permissions, loadCategories]);

  const groupTitles: Record<string, string> = { abroad: "Abroad", islamabad: "Islamabad", karachi: "Karachi", kashmir: "Kashmir", kpk: "KPK", lahore: "Lahore", "other-mix-cities": "Other Mix Cities", "sahiwal-okara-faisalabad": "Sahiwal / Okara / Faisalabad", "south-punjab": "South Punjab" };
  const title = groupTitles[group] || group;

  if (!permissions.includes("profiles.view")) return <section className="rounded-lg border border-[#E5E7EB] bg-white p-7"><h1 className="text-xl font-semibold text-[#0B2A4A]">Access unavailable</h1></section>;

  return <div className="mx-auto w-full max-w-[1440px] space-y-6 sm:space-y-7"><header className="rounded-2xl border border-[#E9E4D8] bg-[linear-gradient(115deg,#fff_0%,#fff_70%,#FBF8EF_100%)] p-4 shadow-[0_4px_20px_rgba(23,32,51,0.035)] sm:p-6 lg:p-7"><nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#8A94A2]"><Link href="/dashboard/profile-groups" className="hover:text-[#0B2A4A]">Profile Groups</Link><span aria-hidden="true">/</span><span className="text-[#0B2A4A]">{title}</span></nav><div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A7625]">Explore the region</p><h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.025em] text-[#0B2A4A] sm:text-3xl">{title} Group</h1><p className="mt-2 text-sm text-[#64748B]">Choose a category, then refine the profiles by gender.</p></div><Link href="/dashboard/profile-groups" className="inline-flex min-h-10 items-center rounded-lg border border-[#DDE2E7] bg-white px-4 text-xs font-semibold text-[#526071] transition hover:border-[#C89B2C] hover:bg-[#FBF8EF]">← All groups</Link></div></header>
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold text-[#0B2A4A]">Categories</h2><p className="mt-1 text-xs text-[#84909E]">Select a category to view matching profiles.</p></div>{!loading && !error && <span className="rounded-full border border-[#E5E0D5] bg-white px-3 py-1.5 text-xs font-medium text-[#64748B]">{categories.length} categories</span>}</div>
    {loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-40 animate-pulse rounded-2xl border border-[#E8E0D0] bg-white p-5"><div className="size-10 rounded-xl bg-[#F0EEE8]"/><div className="mt-5 h-4 w-1/2 rounded bg-[#F0EEE8]"/></div>)}</div>
      : error ? <section className="rounded-2xl border border-[#E8C7C2] bg-white p-8 text-center"><p className="text-sm text-[#8F3028]">{error}</p><button type="button" onClick={() => void loadCategories()} className="mt-4 min-h-10 rounded-lg bg-[#0B2A4A] px-4 text-sm font-semibold text-white">Try again</button></section>
        : categories.length === 0 ? <section className="rounded-2xl border border-[#E8E0D0] bg-white p-10 text-center"><h2 className="font-semibold text-[#0B2A4A]">No categories configured</h2><p className="mt-2 text-sm text-[#64748B]">This group can be browsed once categories are added.</p></section>
          : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{categories.map((category, index) => <article key={category.slug} onMouseEnter={() => setHovered(category.slug)} onMouseLeave={() => setHovered(null)} className={`group flex min-h-[174px] flex-col rounded-2xl border bg-white p-4 shadow-[0_3px_14px_rgba(23,32,51,0.03)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(23,32,51,0.08)] ${hovered === category.slug ? "border-[#D8C99F]" : "border-[#E7E2D7]"}`}><Link href={`/dashboard/profile-groups/${group}/${category.slug}`} className="flex min-h-0 flex-1 flex-col rounded-xl focus-visible:outline-2 focus-visible:outline-[#C89B2C]" aria-label={`Browse ${category.label}`}><span aria-hidden="true" className="flex size-9 items-center justify-center rounded-xl border border-[#EEE8DA] bg-[#FBF8EF] text-[10px] font-bold text-[#9A7625]">{String(index + 1).padStart(2, "0")}</span><h2 className="mt-4 line-clamp-2 text-sm font-semibold text-[#0B2A4A]">{category.label}</h2><p className="mt-auto pt-2 text-xs text-[#64748B]"><span className="font-semibold tabular-nums text-[#0B2A4A]">{category.count.toLocaleString()}</span> profiles</p></Link><div className="mt-3 border-t border-[#F0ECE3] pt-3 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"><GenderChoice label={`${category.label} gender`} onSelect={(gender: ProfileGender) => { router.push(`/dashboard/profile-groups/${group}/${category.slug}?gender=${gender}`); }} /></div></article>)}</div>}
  </div>;
}
