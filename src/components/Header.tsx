"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useConfirm, useToast } from "@/components/ToastProvider";
import ProfilePhoto from "@/components/ProfilePhoto";

export default function Header({
  mobileMenuOpen,
  onMenuClick,
}: {
  mobileMenuOpen: boolean;
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const requestConfirmation = useConfirm();
  const { notify } = useToast();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const headerName = user?.name || "Administrator";
  const pageTitle = pathname === "/" || pathname === "/dashboard"
    ? "DASHBOARD"
    : pathname === "/dashboard/roles-permissions"
      ? "ROLES & PERMISSIONS"
    : pathname === "/dashboard/users"
      ? "USERS"
      : pathname === "/dashboard/edit-profile"
        ? "EDIT PROFILE"
        : "PROFILES";
  const subtitle = pathname === "/" || pathname === "/dashboard"
    ? "Overview of your marriage bureau"
    : pathname === "/dashboard/roles-permissions"
      ? "Manage administrator roles and access"
      : pathname === "/dashboard/users"
        ? "Manage registered users"
        : pathname === "/dashboard/edit-profile"
          ? "Manage your administrator profile"
          : "Manage registered profiles";

  function handleLogout(): void {
    requestConfirmation({
      title: "Logout?",
      message: "Are you sure you want to logout from your account?",
      confirmLabel: "Logout",
      pendingLabel: "Logging out...",
      cancelLabel: "Cancel",
      destructive: true,
      onConfirm: logout,
      onError: (error) => notify({
        variant: "error",
        title: "Unable to sign out",
        message: error instanceof Error ? error.message : "Please try again.",
      }),
    });
  }

  useEffect(() => {
    if (!accountMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountMenuOpen]);

  return (
    <header className="relative flex h-[68px] shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-4 sm:px-6 lg:px-8">
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
        <div className="hidden min-w-0 flex-col gap-1 lg:flex">
          <h2 className="truncate text-lg font-semibold leading-5 tracking-[-0.02em] text-[#0B2A4A]">{pageTitle}</h2>
          <p className="truncate text-xs leading-4 text-[#64748B]">{subtitle}</p>
        </div>
        <div className="absolute left-1/2 top-1/2 right-1/8 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 lg:hidden">
          <Image
            src="/images/logo-icon.png"
            alt="Trust Forever"
            width={32}
            height={32}
            priority
            className="size-8 shrink-0 object-contain"
          />

          <span className="min-w-0">
            <span className="block whitespace-nowrap text-[11px] font-semibold tracking-[0.06em] text-[#0B2A4A]">
              TRUST FOREVER
            </span>

            <span className="mt-0.5 block whitespace-nowrap text-[10px] text-[#64748B]">
              Marriage Bureau
            </span>
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
          <span aria-hidden="true" className="relative flex size-9 items-center justify-center overflow-hidden rounded-full border border-[#EAB308]/70 bg-[#0F172A] text-xs font-semibold text-[#F8FAFC] ring-2 ring-[#C89B2C] ring-offset-2 ring-offset-white">
            <ProfilePhoto src={user?.profile_picture_url} alt="Administrator" fill sizes="36px" className="object-cover" />
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-medium leading-5 text-[#172033]">{headerName}</span>
            <span className="block text-xs leading-4 text-[#64748B]">Trust Forever</span>
          </span>
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={`size-4 text-[#64748B] transition-transform ${accountMenuOpen ? "rotate-180" : ""}`}>
            <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {accountMenuOpen && (
          <div role="menu" aria-label="Administrator account" className="absolute right-0 top-full z-40 mt-3 w-56 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white py-1.5 shadow-[0_12px_32px_rgba(23,32,51,0.16)]">
            <div className="border-b border-[#EEF0F2] px-4 py-3 sm:hidden">
              <p className="text-sm font-medium text-[#172033]">{headerName}</p>
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
                handleLogout();
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

    </header>
  );
}
