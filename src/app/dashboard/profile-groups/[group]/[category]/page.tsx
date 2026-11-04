"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import ProfilePhoto from "@/components/ProfilePhoto";
import { useAuth } from "@/components/AuthProvider";
import GenderChoice, { type ProfileGender } from "@/components/profiles/GenderChoice";
import { ApiError, listProfileGroupCategories, listProfileGroupProfiles, type MatrimonialProfile, type ProfileGroup, type ProfileGroupFilters } from "@/services/rolesPermissions";

const blankFilters: ProfileGroupFilters = { search: "", city: "", caste: "", marital_status: undefined, education: "", occupation: "", min_age: "", max_age: "", page: 1, per_page: 24 };
const groupTitles: Record<string, string> = { abroad: "Abroad", islamabad: "Islamabad", karachi: "Karachi", kashmir: "Kashmir", kpk: "KPK", lahore: "Lahore", "other-mix-cities": "Other Mix Cities", "sahiwal-okara-faisalabad": "Sahiwal / Okara / Faisalabad", "south-punjab": "South Punjab" };

function ProfileCard({ profile, listView }: { profile: MatrimonialProfile; listView: boolean }) {
  return <article className={`group overflow-hidden rounded-2xl border border-[#E6E2D8] bg-white shadow-[0_4px_18px_rgba(23,32,51,0.045)] transition duration-200 hover:-translate-y-0.5 hover:border-[#D8C99F] hover:shadow-[0_12px_28px_rgba(23,32,51,0.1)] ${listView ? "sm:flex sm:items-center sm:gap-5 sm:p-4" : "p-4 sm:p-5"}`}>
    <div className={`flex gap-4 ${listView ? "sm:w-[36%] sm:shrink-0" : ""}`}><div className="relative size-[76px] shrink-0 overflow-hidden rounded-xl border border-[#EEE8DA] bg-[#FBF8EF] sm:size-[88px]"><ProfilePhoto src={profile.profile_picture_url} profileId={profile.id} filenamePrefix={profile.profile_id} alt={profile.name || "Matrimonial profile"} fill sizes="88px" className="object-cover transition duration-300 group-hover:scale-[1.03]" /></div><div className="min-w-0 flex-1 py-0.5"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9A7625]">{profile.profile_id}</p><h2 className="mt-1 truncate text-base font-semibold text-[#0B2A4A] sm:text-lg">{profile.name || "Profile details"}</h2><p className="mt-1 text-xs capitalize text-[#64748B]">{[profile.gender, profile.marital_status].filter(Boolean).join(" · ") || "Details not provided"}</p><p className="mt-1 text-sm font-medium text-[#334155]">{profile.age ? `${profile.age} years` : "Age not provided"}{profile.height ? ` · ${profile.height}` : ""}</p></div></div>
    <div className={`mt-4 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-[#F0ECE3] py-4 text-sm ${listView ? "sm:mt-0 sm:flex-1 sm:grid-cols-4 sm:border-0 sm:py-0" : ""}`}><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA3AF]">City</p><p className="mt-1 truncate font-medium text-[#334155]">{profile.city || "—"}</p></div><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA3AF]">Education</p><p className="mt-1 truncate font-medium text-[#334155]">{profile.qualification || "—"}</p></div><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA3AF]">Occupation</p><p className="mt-1 truncate font-medium text-[#334155]">{[profile.job, profile.business].filter(Boolean).join(" · ") || "—"}</p></div><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wider text-[#9AA3AF]">Caste</p><p className="mt-1 truncate font-medium text-[#334155]">{profile.caste || "—"}</p></div></div>
    <div className={`flex items-center justify-between border-t border-[#F0ECE3] pt-3 ${listView ? "sm:w-36 sm:shrink-0 sm:border-0 sm:pt-0" : ""}`}><span className="text-xs text-[#94A3B8]">Trust Forever</span><Link href={`/dashboard/profiles/${profile.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-[#0B2A4A] transition hover:bg-[#F7F5EF] hover:text-[#9A7625] focus-visible:outline-2 focus-visible:outline-[#C89B2C]">View profile <span aria-hidden="true">→</span></Link></div>
  </article>;
}

function FilterInput({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`block min-w-0 text-xs font-semibold text-[#526071] ${className}`}>{label}{children}</label>;
}

function filterInputClass(): string {
  return "mt-1.5 min-h-11 w-full rounded-xl border border-[#DDE2E7] bg-[#FCFCFB] px-3.5 text-sm font-normal text-[#172033] outline-none transition placeholder:text-[#A0A8B3] hover:border-[#C6CDD5] focus:border-[#C89B2C] focus:bg-white focus:ring-4 focus:ring-[#C89B2C]/10";
}

export default function ProfileGroupCategoryPage() {
  const { permissions } = useAuth();
  const params = useParams<{ group: string; category: string }>();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<ProfileGroup[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<MatrimonialProfile[]>([]);
  const [draft, setDraft] = useState<ProfileGroupFilters>(blankFilters);
  const [filters, setFilters] = useState<ProfileGroupFilters>(blankFilters);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const initialGender = searchParams.get("gender");
  const [gender, setGender] = useState<ProfileGender | "">(initialGender === "male" || initialGender === "female" ? initialGender : "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [listView, setListView] = useState(false);

  const category = categories.find((item) => item.slug === params.category);
  const title = groupTitles[params.group] || params.group;
  const activeFilters = useMemo(() => Object.entries(filters).filter(([key, value]) => !["page", "per_page"].includes(key) && value !== undefined && value !== "").map(([key, value]) => ({ key: key as keyof ProfileGroupFilters, label: ({ search: "Search", city: "City", caste: "Caste", marital_status: "Status", education: "Education", occupation: "Occupation", min_age: "Min age", max_age: "Max age" } as Record<string, string>)[key] || key, value: String(value) })), [filters]);

  const loadCategories = useCallback(async () => {
    try {
      const result = await listProfileGroupCategories(params.group);
      setCategories(result.categories);
      setCities(result.cities);
    } catch {
      setCategories([]);
      setCities([]);
    }
  }, [params.group]);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listProfileGroupProfiles(params.group, params.category, { ...filters, gender: gender || undefined, page });
      setProfiles(result.profiles);
      setTotal(result.total);
      setLastPage(result.last_page);
    } catch (loadError) {
      setError(loadError instanceof ApiError ? loadError.message : "Unable to load matching profiles.");
    } finally { setLoading(false); }
  }, [params.group, params.category, filters, page, gender]);

  useEffect(() => { if (permissions.includes("profiles.view")) void loadCategories(); }, [permissions, loadCategories]);
  useEffect(() => { if (permissions.includes("profiles.view")) void loadProfiles(); }, [permissions, loadProfiles]);

  function applyFilters(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setPage(1);
    setFilters({ ...draft, page: 1 });
    setFiltersOpen(false);
  }

  function resetFilters(): void {
    setDraft(blankFilters);
    setFilters(blankFilters);
    setPage(1);
    setGender("");
    window.history.replaceState(null, "", window.location.pathname);
  }

  function removeFilter(key: keyof ProfileGroupFilters): void {
    const next = { ...draft, [key]: key === "marital_status" || key === "gender" ? undefined : "" };
    setDraft(next);
    setFilters(next);
    setPage(1);
  }

  function selectGender(value: ProfileGender): void {
    setGender(value);
    setPage(1);
    const query = new URLSearchParams(searchParams.toString());
    query.set("gender", value);
    window.history.replaceState(null, "", `?${query.toString()}`);
  }

  if (!permissions.includes("profiles.view")) return <section className="mx-auto max-w-3xl rounded-2xl border border-[#E5E7EB] bg-white p-7"><h1 className="text-xl font-semibold text-[#0B2A4A]">Access unavailable</h1><p className="mt-2 text-sm text-[#64748B]">Your account does not have permission to view matrimonial profiles.</p></section>;

  return <div className="mx-auto w-full max-w-[1440px] space-y-6 sm:space-y-7">
    <header className="rounded-2xl border border-[#E9E4D8] bg-[linear-gradient(115deg,#fff_0%,#fff_68%,#FBF8EF_100%)] p-4 shadow-[0_4px_20px_rgba(23,32,51,0.035)] sm:p-6 lg:p-7">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#8A94A2]"><Link href="/dashboard/profile-groups" className="transition hover:text-[#0B2A4A]">Profile Groups</Link><span aria-hidden="true">/</span><Link href={`/dashboard/profile-groups/${params.group}`} className="transition hover:text-[#0B2A4A]">{title}</Link><span aria-hidden="true">/</span><span className="text-[#0B2A4A]">{category?.label || "Category"}</span></nav>
      <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A7625]">Curated profile collection</p><h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.025em] text-[#0B2A4A] sm:text-3xl">{category?.label || "Matching profiles"}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">Browse {title} profiles and refine your search using verified profile details.</p></div><div className="flex items-center gap-3 rounded-xl border border-[#E8E0D0] bg-white/80 px-4 py-3"><span className="flex size-9 items-center justify-center rounded-full bg-[#FBF8EF] text-[#9A7625]" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0m2-10a3 3 0 1 0 0-6m1 9a5 5 0 0 1 3 4.5" strokeLinecap="round"/></svg></span><div><p className="text-xl font-semibold leading-5 tabular-nums text-[#0B2A4A]">{loading ? "—" : total.toLocaleString()}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#8993A0]">Matching profiles</p></div></div></div>
      <div className="mt-6 border-t border-[#EEE9DF] pt-5"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-sm font-semibold text-[#172B45]">Choose a profile gender</h2><p className="mt-0.5 text-xs text-[#84909E]">Select one to refine this category.</p></div>{gender && <span className="rounded-full bg-[#F5F1E5] px-3 py-1 text-xs font-semibold capitalize text-[#83671F]">{gender} selected</span>}</div><GenderChoice variant="cards" selected={gender || undefined} onSelect={selectGender} /></div>
    </header>

    <section className="overflow-hidden rounded-2xl border border-[#E6E2D8] bg-white shadow-[0_4px_18px_rgba(23,32,51,0.04)]" aria-label="Search and filter profiles">
      <form onSubmit={applyFilters}>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2.5 border-b border-[#F0ECE3] p-3.5 sm:gap-3 sm:p-4 lg:flex lg:p-4"><FilterInput label="Search profiles" className="col-span-2 min-w-0 lg:flex-1"><span className="relative mt-1 block"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-[#8D98A5]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg><input type="search" value={draft.search || ""} onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))} placeholder="Name, ID, age, education, occupation" className={`${filterInputClass()} mt-0 h-11 pl-10 pr-10`} /><button type="button" aria-label="Clear search" onClick={() => setDraft((current) => ({ ...current, search: "" }))} className={`absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[#8993A0] hover:bg-[#F3F4F6] ${draft.search ? "" : "hidden"}`}>×</button></span></FilterInput><button type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#DDE2E7] bg-white px-3 text-xs font-semibold text-[#334155] transition hover:border-[#C89B2C] hover:bg-[#FBF8EF] sm:px-4 sm:text-sm lg:min-w-32"><svg viewBox="0 0 24 24" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M4 7h16M7 12h10m-7 5h4"/><circle cx="8" cy="7" r="1.5" fill="white"/><circle cx="15" cy="12" r="1.5" fill="white"/></svg>Filters{activeFilters.length > 0 && <span className="flex size-5 items-center justify-center rounded-full bg-[#0B2A4A] text-[10px] text-white">{activeFilters.length}</span>}</button><button type="submit" className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[#0B2A4A] px-3 text-xs font-semibold text-white shadow-[0_3px_10px_rgba(11,42,74,0.13)] transition hover:bg-[#123E68] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C] sm:px-5 sm:text-sm">Search <span aria-hidden="true">→</span></button></div>
        <div className={`${filtersOpen ? "grid" : "hidden lg:grid"} grid-cols-1 gap-3 border-b border-[#F0ECE3] bg-[#FCFCFB] p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3 xl:grid-cols-6`}>
          <FilterInput label="City"><input list="profile-group-cities" value={draft.city || ""} onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))} placeholder="Search or choose city" className={filterInputClass()} /><datalist id="profile-group-cities">{cities.map((city) => <option key={city} value={city} />)}</datalist></FilterInput>
          <FilterInput label="Caste"><input list="profile-group-castes" value={draft.caste || ""} onChange={(event) => setDraft((current) => ({ ...current, caste: event.target.value }))} placeholder="Search caste" className={filterInputClass()} /><datalist id="profile-group-castes">{categories.filter((item) => item.slug !== "all-profiles").map((item) => <option key={item.slug} value={item.label} />)}</datalist></FilterInput>
          <FilterInput label="Marital status"><select value={draft.marital_status || ""} onChange={(event) => setDraft((current) => ({ ...current, marital_status: (event.target.value || undefined) as MatrimonialProfile["marital_status"] }))} className={filterInputClass()}><option value="">Any status</option><option value="unmarried">Unmarried</option><option value="married">Married</option><option value="divorced">Divorced</option><option value="widowed">Widowed</option><option value="nikah_broken">Nikah Broken</option></select></FilterInput>
          <FilterInput label="Education"><input list="profile-group-education" value={draft.education || ""} onChange={(event) => setDraft((current) => ({ ...current, education: event.target.value }))} placeholder="Search qualification" className={filterInputClass()} /><datalist id="profile-group-education">{["MBBS", "BDS", "Bachelor", "Masters", "MPhil", "PhD", "Engineering"].map((option) => <option key={option} value={option} />)}</datalist></FilterInput>
          <FilterInput label="Occupation"><input value={draft.occupation || ""} onChange={(event) => setDraft((current) => ({ ...current, occupation: event.target.value }))} placeholder="Job or business" className={filterInputClass()} /></FilterInput>
          <div className="grid grid-cols-2 gap-2"><FilterInput label="Min age"><input type="number" min="18" max="100" value={draft.min_age || ""} onChange={(event) => setDraft((current) => ({ ...current, min_age: event.target.value }))} placeholder="18" className={filterInputClass()} /></FilterInput><FilterInput label="Max age"><input type="number" min="18" max="100" value={draft.max_age || ""} onChange={(event) => setDraft((current) => ({ ...current, max_age: event.target.value }))} placeholder="100" className={filterInputClass()} /></FilterInput></div>
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3 xl:col-span-6"><button type="submit" className="min-h-10 rounded-lg bg-[#0B2A4A] px-5 text-xs font-semibold text-white hover:bg-[#123E68]">Apply filters</button><button type="button" onClick={resetFilters} className="min-h-10 rounded-lg border border-[#DDE2E7] bg-white px-4 text-xs font-semibold text-[#526071] hover:border-[#C89B2C]">Reset all</button><span className="ml-auto hidden text-xs text-[#8B95A2] sm:block">Filters combine with {title} · {category?.label}</span></div>
        </div>
      </form>
      {(activeFilters.length > 0 || gender) && <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5"><span className="mr-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#8B95A2]">Active filters</span>{gender && <button type="button" onClick={() => { setGender(""); window.history.replaceState(null, "", window.location.pathname); }} className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-[#D9D0B9] bg-[#F9F6EC] px-3 text-xs font-medium capitalize text-[#715B22]">{gender}<span aria-hidden="true">×</span></button>}{activeFilters.map(({ key, label, value }) => <button key={key} type="button" onClick={() => removeFilter(key)} className="inline-flex min-h-7 max-w-full items-center gap-1.5 rounded-full border border-[#DDE2E7] bg-white px-3 text-xs font-medium text-[#526071]"><span className="truncate">{label}: {value}</span><span aria-hidden="true" className="shrink-0 text-[#8993A0]">×</span></button>)}<button type="button" onClick={resetFilters} className="ml-auto min-h-8 px-2 text-xs font-semibold text-[#8A6B20] hover:underline">Reset filters</button></div>}
    </section>

    <section aria-live="polite" className="space-y-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold tracking-tight text-[#0B2A4A]">Profiles <span className="ml-1 text-sm font-medium text-[#8B95A2]">{total.toLocaleString()}</span></h2><p className="mt-1 text-xs text-[#8B95A2]">{gender ? `${gender[0].toUpperCase()}${gender.slice(1)} profiles` : "All genders"} · {category?.label || "Selected category"}</p></div><div className="inline-flex rounded-lg border border-[#E1E5E9] bg-white p-1" role="group" aria-label="Profile layout"><button type="button" onClick={() => setListView(false)} aria-pressed={!listView} aria-label="Grid view" className={`flex size-9 items-center justify-center rounded-md ${!listView ? "bg-[#0B2A4A] text-white" : "text-[#758190] hover:bg-[#F5F6F7]"}`}><svg viewBox="0 0 20 20" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.5"><rect x="2.5" y="2.5" width="6" height="6" rx="1"/><rect x="11.5" y="2.5" width="6" height="6" rx="1"/><rect x="2.5" y="11.5" width="6" height="6" rx="1"/><rect x="11.5" y="11.5" width="6" height="6" rx="1"/></svg></button><button type="button" onClick={() => setListView(true)} aria-pressed={listView} aria-label="List view" className={`flex size-9 items-center justify-center rounded-md ${listView ? "bg-[#0B2A4A] text-white" : "text-[#758190] hover:bg-[#F5F6F7]"}`}><svg viewBox="0 0 20 20" fill="none" className="size-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M7 4h10M7 10h10M7 16h10"/><circle cx="3.5" cy="4" r=".8" fill="currentColor"/><circle cx="3.5" cy="10" r=".8" fill="currentColor"/><circle cx="3.5" cy="16" r=".8" fill="currentColor"/></svg></button></div></div>
      {error ? <div className="rounded-2xl border border-[#E9C9C4] bg-white px-6 py-12 text-center"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#FBF0EE] text-xl text-[#8F3028]">!</span><h3 className="mt-3 font-semibold text-[#0B2A4A]">We couldn’t load these profiles</h3><p className="mt-1 text-sm text-[#64748B]">{error}</p><button type="button" onClick={() => void loadProfiles()} className="mt-4 min-h-10 rounded-lg bg-[#0B2A4A] px-4 text-sm font-semibold text-white">Try again</button></div>
        : loading ? <div className={listView ? "space-y-3" : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"}>{Array.from({ length: 6 }, (_, index) => <div key={index} className={`animate-pulse rounded-2xl border border-[#E8E4DB] bg-white p-5 ${listView ? "h-36" : "h-72"}`}><div className="flex gap-4"><div className="size-20 rounded-xl bg-[#F0EEE8]"/><div className="flex-1 space-y-3 pt-2"><div className="h-3 w-1/3 rounded bg-[#F0EEE8]"/><div className="h-4 w-2/3 rounded bg-[#F0EEE8]"/><div className="h-3 w-1/2 rounded bg-[#F0EEE8]"/></div></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="h-9 rounded bg-[#F7F6F2]"/><div className="h-9 rounded bg-[#F7F6F2]"/></div></div>)}</div>
          : profiles.length === 0 ? <div className="rounded-2xl border border-dashed border-[#D9D4C8] bg-white px-5 py-14 text-center shadow-[0_3px_15px_rgba(23,32,51,0.025)]"><span aria-hidden="true" className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#FBF8EF] text-[#9A7625]"><svg viewBox="0 0 24 24" fill="none" className="size-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5M8 11h5"/></svg></span><h3 className="mt-4 text-base font-semibold text-[#0B2A4A]">No profiles match these filters</h3><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#758190]">Try a different search or remove one of the active filters to see more profiles in this collection.</p><button type="button" onClick={resetFilters} className="mt-5 min-h-10 rounded-lg border border-[#D9D0B9] bg-[#FBF8EF] px-4 text-sm font-semibold text-[#715B22] hover:bg-[#F5EEDC]">Clear filters</button></div>
            : <><div className={listView ? "space-y-3" : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"}>{profiles.map((profile) => <ProfileCard key={profile.id} profile={profile} listView={listView}/>)}</div><div className="flex flex-col gap-3 rounded-xl border border-[#E6E2D8] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-[#758190]">Showing <span className="font-semibold text-[#334155]">{Math.min((page - 1) * 24 + 1, total)}–{Math.min(page * 24, total)}</span> of <span className="font-semibold text-[#334155]">{total.toLocaleString()}</span></p><div className="flex gap-2"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))} className="min-h-10 flex-1 rounded-lg border border-[#DDE2E7] px-4 text-xs font-semibold text-[#526071] transition hover:bg-[#F7F8F9] disabled:opacity-40 sm:flex-none">← Previous</button><span className="flex min-h-10 items-center px-2 text-xs font-medium text-[#758190]">Page {page} of {lastPage}</span><button type="button" disabled={page >= lastPage || loading} onClick={() => setPage((value) => Math.min(lastPage, value + 1))} className="min-h-10 flex-1 rounded-lg border border-[#DDE2E7] px-4 text-xs font-semibold text-[#526071] transition hover:bg-[#F7F8F9] disabled:opacity-40 sm:flex-none">Next →</button></div></div></>}
    </section>
  </div>;
}
