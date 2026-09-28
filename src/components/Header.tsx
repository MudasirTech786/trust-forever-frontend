"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Header({
  mobileMenuOpen,
  onMenuClick,
}: {
  mobileMenuOpen: boolean;
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [logoutNoticeOpen, setLogoutNoticeOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const pageTitle = pathname === "/dashboard"
    ? "Dashboard"
    : pathname === "/dashboard/edit-profile"
      ? "Edit Profile"
      : "Profiles";
  const subtitle = pathname === "/dashboard"
    ? "Overview of your marriage bureau"
    : pathname === "/dashboard/edit-profile"
      ? "Manage your administrator profile"
      : "Manage registered profiles";

  useEffect(() => {
    if (!accountMenuOpen && !logoutNoticeOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
        setLogoutNoticeOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountMenuOpen, logoutNoticeOpen]);

  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          title={mobileMenuOpen ? "Close navigation" : "Open navigation"}
          onClick={onMenuClick}
          className="flex size-10 shrink-0 items-center justify-center rounded-md border border-[#E8E0D0] bg-[#FBF9F4] text-[#0B2A4A] transition hover:border-[#C69A2B]/50 hover:bg-[#F3EBDD] lg:hidden"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-5">
            {mobileMenuOpen
              ? <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              : <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
          </svg>
        </button>
        <div className="hidden min-w-0 lg:block">
          <h2 className="text-sm font-semibold text-[#172033]">{pageTitle}</h2>
          <p className="mt-0.5 hidden text-xs text-[#64748B] sm:block">{subtitle}</p>
        </div>
        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          <Image src="/images/icon.png" alt="" width={36} height={36} priority className="size-9 shrink-0 object-contain" />
          <span className="min-w-0">
            <span className="block truncate text-[11px] font-semibold tracking-[0.06em] text-[#0B2A4A]">TRUST FOREVER</span>
            <span className="mt-0.5 block truncate text-[10px] text-[#64748B]">Marriage Bureau</span>
          </span>
        </div>
      </div>

      <div ref={accountMenuRef} className="relative">
        <button
          type="button"
          aria-label="Open administrator menu"
          aria-haspopup="menu"
          aria-expanded={accountMenuOpen}
          onClick={() => setAccountMenuOpen((isOpen) => !isOpen)}
          className="flex items-center gap-3 rounded-md px-1 py-1 text-left transition hover:bg-[#F7F7F5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C]"
        >
          <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full border border-[#EAB308]/70 bg-[#0F172A] text-xs font-semibold text-[#F8FAFC] ring-2 ring-[#C89B2C] ring-offset-2 ring-offset-white">
            A
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-medium leading-5 text-[#172033]">Administrator</span>
            <span className="block text-xs leading-4 text-[#64748B]">Trust Forever</span>
          </span>
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={`size-4 text-[#64748B] transition-transform ${accountMenuOpen ? "rotate-180" : ""}`}>
            <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {accountMenuOpen && (
          <div role="menu" aria-label="Administrator account" className="absolute right-0 top-full z-40 mt-3 w-56 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white py-1.5 shadow-[0_12px_32px_rgba(23,32,51,0.16)]">
            <div className="border-b border-[#EEF0F2] px-4 py-3 sm:hidden">
              <p className="text-sm font-medium text-[#172033]">Administrator</p>
              <p className="mt-0.5 text-xs text-[#64748B]">Trust Forever</p>
            </div>
            <Link
              href="/dashboard/edit-profile"
              role="menuitem"
              onClick={() => setAccountMenuOpen(false)}
              className="flex min-h-11 items-center gap-3 px-4 text-sm text-[#334155] transition hover:bg-[#F7F7F5] hover:text-[#0B2A4A] focus-visible:bg-[#F7F7F5] focus-visible:outline-none"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-[18px] text-[#64748B]">
                <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.4" />
                <path d="M4 17a6 6 0 0 1 12 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Edit Profile
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setAccountMenuOpen(false);
                setLogoutNoticeOpen(true);
              }}
              className="flex min-h-11 w-full items-center gap-3 px-4 text-sm text-[#7C3F36] transition hover:bg-[#FBF4F2] focus-visible:bg-[#FBF4F2] focus-visible:outline-none"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-[18px]">
                <path d="M8 3.5H4.5v13H8m3-3 3-3-3-3m3 3H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>

      {logoutNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B2A4A]/35 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setLogoutNoticeOpen(false);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="logout-notice-title" className="w-full max-w-sm rounded-lg border border-[#E8E0D0] bg-white p-6 shadow-[0_20px_60px_rgba(11,42,74,0.2)]">
            <div className="flex size-11 items-center justify-center rounded-full bg-[#F7F2E5] text-[#9A7625]">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-5">
                <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M10 6v4.5m0 3h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#9A7625]">Coming soon</p>
            <h2 id="logout-notice-title" className="mt-1 text-lg font-semibold text-[#172033]">Logout isn&apos;t available yet</h2>
            <p className="mt-2 text-sm leading-6 text-[#64748B]">Sign-out will be available when account access is connected. Your session remains active.</p>
            <button type="button" autoFocus onClick={() => setLogoutNoticeOpen(false)} className="mt-5 min-h-10 rounded-md bg-[#0B2A4A] px-4 text-sm font-medium text-white transition hover:bg-[#123E68] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C]">
              Got it
            </button>
          </section>
        </div>
      )}
    </header>
  );
}