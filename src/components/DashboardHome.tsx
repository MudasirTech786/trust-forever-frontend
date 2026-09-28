import Link from "next/link";

const stats = [
  { label: "Total Profiles", value: "1,248", note: "Registered profiles", trend: "+8.4%", icon: "profiles" },
  { label: "Active Profiles", value: "1,086", note: "Currently active", trend: "+5.2%", icon: "active" },
  { label: "Pending Verification", value: "42", note: "Awaiting review", trend: "12 new", icon: "pending" },
  { label: "New This Month", value: "86", note: "New registrations", trend: "+12.6%", icon: "new" },
];

const recentProfiles = [
  { id: "TF-10241", name: "Muhammad Ahmed", gender: "Male", age: 29, city: "Lahore", status: "Active", date: "Sep 28, 2026" },
  { id: "TF-10240", name: "Ayesha Khan", gender: "Female", age: 26, city: "Islamabad", status: "Pending", date: "Sep 27, 2026" },
  { id: "TF-10239", name: "Usman Malik", gender: "Male", age: 32, city: "Karachi", status: "Active", date: "Sep 26, 2026" },
  { id: "TF-10238", name: "Fatima Siddiqui", gender: "Female", age: 28, city: "Lahore", status: "Active", date: "Sep 25, 2026" },
  { id: "TF-10237", name: "Hassan Raza", gender: "Male", age: 30, city: "Rawalpindi", status: "Pending", date: "Sep 24, 2026" },
];

const overview = [
  { label: "Male", value: "54%", amount: 54, color: "bg-[#0B2A4A]" },
  { label: "Female", value: "43%", amount: 43, color: "bg-[#C89B2C]" },
  { label: "Pending verification", value: "3%", amount: 3, color: "bg-[#D8DEE7]" },
];

function StatIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    profiles: <><circle cx="8" cy="7" r="3" /><path d="M2.5 17a5.5 5.5 0 0 1 11 0M14 4.5a2.5 2.5 0 0 1 0 5m1 2a5 5 0 0 1 2.5 4.3" /></>,
    active: <><circle cx="10" cy="10" r="7.5" /><path d="m6.5 10 2.2 2.2 4.8-5" /></>,
    pending: <><circle cx="10" cy="10" r="7.5" /><path d="M10 5.5v4.8l3 1.8" /></>,
    new: <><path d="M10 2.5v15M2.5 10h15" /><circle cx="10" cy="10" r="7.5" /></>,
  };

  return (
    <span className="flex size-10 items-center justify-center rounded-md bg-[#FBF8EF] text-[#B18421]">
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {paths[name]}
      </svg>
    </span>
  );
}

export default function DashboardHome() {
  const formattedDate = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-7 font-sans text-[#0F172A]">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#B18421]">Trust Forever Marriage Bureau</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#0B2A4A]">Good morning, Admin</h1>
          <p className="mt-1 text-sm text-[#64748B]">A clear view of your bureau&apos;s activity and profiles.</p>
        </div>
        <p className="text-xs font-medium text-[#64748B] sm:text-sm">{formattedDate}</p>
      </section>

      <section aria-label="Profile statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="min-w-0 border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_8px_rgba(23,32,51,0.035)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#64748B]">{stat.label}</p>
                <p className="mt-3 text-[28px] leading-none font-semibold text-[#172033]">{stat.value}</p>
              </div>
              <StatIcon name={stat.icon} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <p className="text-xs text-[#64748B]">{stat.note}</p>
              <span className="text-xs font-medium text-[#657A5C]">{stat.trend}</span>
            </div>
          </article>
        ))}
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 border border-[#E5E7EB] bg-white shadow-[0_2px_8px_rgba(23,32,51,0.035)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-[#172033]">Recent Profiles</h2>
              <p className="mt-1 text-xs text-[#64748B]">The latest member registrations</p>
            </div>
            <Link href="/dashboard/profiles" className="inline-flex items-center gap-2 text-sm font-medium text-[#0B2A4A] transition-colors hover:text-[#B18421]">
              View All Profiles
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#FAFAF8] text-[11px] font-semibold tracking-wide text-[#64748B]">
                  <th className="px-5 py-3 sm:px-6">PROFILE</th>
                  <th className="px-4 py-3">GENDER / AGE</th>
                  <th className="px-4 py-3">CITY</th>
                  <th className="px-4 py-3">STATUS</th>
                  <th className="px-4 py-3">REGISTERED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F2]">
                {recentProfiles.map((profile) => (
                  <tr key={profile.id} className="transition-colors hover:bg-[#FCFCFA]">
                    <td className="px-5 py-3.5 sm:px-6">
                      <p className="font-medium text-[#172033]">{profile.name}</p>
                      <p className="mt-0.5 text-xs text-[#64748B]">{profile.id}</p>
                    </td>
                    <td className="px-4 py-3.5 text-[#475569]">{profile.gender}, {profile.age}</td>
                    <td className="px-4 py-3.5 text-[#475569]">{profile.city}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${profile.status === "Active" ? "text-[#55734B]" : "text-[#9A741C]"}`}>
                        <span className={`size-1.5 rounded-full ${profile.status === "Active" ? "bg-[#789269]" : "bg-[#C89B2C]"}`} />
                        {profile.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#64748B]">{profile.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_8px_rgba(23,32,51,0.035)] sm:p-6">
            <h2 className="text-base font-semibold text-[#172033]">Profile Overview</h2>
            <p className="mt-1 text-xs text-[#64748B]">Current profile distribution</p>
            <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-[#EEF0F2]" aria-label="Male 54%, Female 43%, pending verification 3%">
              {overview.map((item) => <span key={item.label} className={item.color} style={{ width: `${item.amount}%` }} />)}
            </div>
            <div className="mt-5 space-y-4">
              {overview.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2.5 text-[#475569]">
                    <span aria-hidden="true" className={`size-2 rounded-full ${item.color}`} />
                    {item.label}
                  </span>
                  <span className="font-semibold text-[#172033]">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-[#EEF0F2] pt-4">
              <p className="text-xs text-[#64748B]">Total Profiles</p>
              <p className="mt-1 text-xl font-semibold text-[#0B2A4A]">1,248</p>
            </div>
          </section>

          <section className="border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_8px_rgba(23,32,51,0.035)] sm:p-6">
            <h2 className="text-base font-semibold text-[#172033]">Quick Actions</h2>
            <Link href="/dashboard/profiles" className="mt-4 flex min-h-11 items-center justify-between border border-[#E5E7EB] px-3.5 text-sm font-medium text-[#0B2A4A] transition-colors hover:border-[#C89B2C]/60 hover:bg-[#FBF8EF]">
              View Profiles
              <span aria-hidden="true" className="text-[#B18421]">&rarr;</span>
            </Link>
            <button type="button" disabled className="mt-2 flex min-h-11 w-full cursor-not-allowed items-center justify-between border border-[#EEF0F2] px-3.5 text-sm text-[#94A3B8]" title="Not available yet">
              Add Profile
              <span className="text-[11px]">Coming soon</span>
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}