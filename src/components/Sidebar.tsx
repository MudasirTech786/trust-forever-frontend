"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
  },
  {
    name: "Profiles",
    href: "/dashboard/profiles",
  },
];

function NavIcon({ name }: { name: "dashboard" | "profiles" }) {
  if (name === "dashboard") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-5 text-[#F8FAFC]">
        <rect x="2.5" y="2.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11.5" y="2.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2.5" y="11.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11.5" y="11.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-5 text-[#F8FAFC]">
      <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1.75 17a5.25 5.25 0 0 1 10.5 0M13 3.4a3 3 0 0 1 0 5.8m1.1 2.6a5.25 5.25 0 0 1 4.15 5.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

type SidebarProps = {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export default function Sidebar({
  expanded,
  onExpandedChange,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const isExpanded = expanded || hoverExpanded || mobileOpen;

  return (
    <aside
      onMouseEnter={() => {
        if (!expanded && window.matchMedia("(min-width: 1024px)").matches) {
          setHoverExpanded(true);
        }
      }}
      onMouseLeave={() => setHoverExpanded(false)}
      className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-[280px] shrink-0 flex-col border-r border-[#334155] bg-[linear-gradient(180deg,#0F172A_0%,#172235_100%)] text-[#F8FAFC] shadow-[0_2px_12px_rgba(15,23,42,0.18)] transition-[width,transform] duration-250 ease-out lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 lg:shadow-none ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${isExpanded ? "lg:w-[260px]" : "lg:w-[80px]"}`}
    >
      <svg aria-hidden="true" viewBox="0 0 240 160" fill="none" className="pointer-events-none absolute bottom-16 right-[-42px] w-52 text-[#EAB308] opacity-[0.06]">
        <path d="M10 100c35-67 71-67 107 0s72 67 108 0M10 124c35-67 71-67 107 0s72 67 108 0" stroke="currentColor" strokeWidth="1.2" />
      </svg>

      <div className={`relative flex min-h-[116px] items-center border-b border-[#334155] px-4 py-5 transition-all duration-200 ${isExpanded ? "justify-between gap-2" : "justify-center"}`}>
        <div className={`flex min-w-0 items-center gap-3 transition-all duration-200 ${isExpanded ? "" : "justify-center"}`}>
          <Image src="/images/icon.png" alt="Trust Forever Marriage Bureau logo" width={44} height={44} priority className="size-11 shrink-0 object-contain" />
          <div className={`min-w-0 transition-all duration-200 ${isExpanded ? "opacity-100" : "pointer-events-none absolute -translate-x-2 opacity-0"}`}>
            <h1 className="truncate text-[13px] font-semibold tracking-[0.07em] text-[#F8FAFC]">TRUST FOREVER</h1>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#EAB308]">Marriage Bureau</p>
          </div>
        </div>

        <button
          type="button"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          onClick={() => {
            if (mobileOpen) {
              onMobileClose();
              return;
            }
            onExpandedChange(!expanded);
          }}
          className={`group hidden size-8 shrink-0 items-center justify-center rounded-full border border-[#475569] bg-[#1E293B] text-[#F8FAFC] shadow-sm transition hover:border-[#EAB308]/70 hover:bg-[#334155] lg:flex ${isExpanded ? "" : "absolute right-[-14px] top-1/2 z-10 -translate-y-1/2 bg-[#1E293B]"}`}
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4 transition-transform duration-200">
            <path d={isExpanded ? "m12 4-6 6 6 6" : "m8 4 6 6-6 6"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {mobileOpen && (
          <button type="button" aria-label="Close navigation menu" onClick={onMobileClose} className="flex size-9 items-center justify-center rounded-full border border-[#475569] bg-[#1E293B] text-[#F8FAFC] lg:hidden">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        )}
      </div>

      <nav aria-label="Main navigation" className={`relative flex flex-1 flex-col gap-1 overflow-visible px-3 py-6 transition-all duration-200 ${isExpanded ? "" : "px-3"}`}>
        {navigation.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              title={!isExpanded ? item.name : undefined}
              onClick={() => {
                if (mobileOpen) onMobileClose();
              }}
              className={`group relative flex min-h-11 items-center gap-3 rounded-md border-l-2 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "border-[#EAB308] bg-[#1E293B] text-[#F8FAFC] shadow-[0_2px_8px_rgba(0,0,0,0.14)]"
                  : "border-transparent text-[#CBD5E1] hover:border-[#D97706]/70 hover:bg-[#1E293B] hover:text-white"
              } ${isExpanded ? "justify-start px-4" : "justify-center px-0"}`}
            >
              <NavIcon name={item.name === "Dashboard" ? "dashboard" : "profiles"} />
              <span className={`whitespace-nowrap transition-all duration-200 ${isExpanded ? "opacity-100" : "pointer-events-none absolute left-12 -translate-x-1 opacity-0"}`}>{item.name}</span>
              {!isExpanded && <span className="pointer-events-none absolute left-[calc(100%+10px)] z-50 hidden whitespace-nowrap rounded border border-[#475569] bg-[#1E293B] px-2.5 py-1.5 text-xs font-medium text-[#F8FAFC] shadow-md group-hover:block group-focus-visible:block">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`relative mx-3 mb-3 flex min-h-[64px] items-center rounded-lg border border-[#334155] bg-[#1E293B] py-3 shadow-[0_2px_8px_rgba(0,0,0,0.16)] transition-all duration-200 ${isExpanded ? "gap-3 px-3" : "justify-center px-1"}`}>
        <div aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#EAB308]/70 bg-[#0F172A] text-xs font-semibold text-[#F8FAFC]">
          A
        </div>
        <div className={`min-w-0 transition-all duration-200 ${isExpanded ? "opacity-100" : "pointer-events-none absolute left-14 translate-x-1 opacity-0"}`}>
          <p className="whitespace-nowrap text-sm font-medium text-[#F8FAFC]">Administrator</p>
          <p className="mt-0.5 whitespace-nowrap text-xs text-[#94A3B8]">Trust Forever</p>
        </div>
      </div>
    </aside>
  );
}