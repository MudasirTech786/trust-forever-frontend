"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: "dashboard",
  },
  {
    name: "Roles & Permissions",
    href: "/dashboard/roles-permissions",
    icon: "roles",
    permission: "roles.view",
  },
  {
    name: "User Management",
    href: "/dashboard/users",
    icon: "users",
    permission: "user.view",
  },
  {
    name: "Profiles",
    href: "/dashboard/profiles",
    icon: "profiles",
  },
  {
    name: "Profile Formater",
    href: "/dashboard/profile-format-converter",
    icon: "profiles",
  },
] as const;

function NavIcon({ name }: { name: "dashboard" | "profiles" | "roles" | "users" }) {
  if (name === "dashboard") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="size-6 text-[#C89B2C] transition-colors group-hover:text-[#E2BC4F]"
      >
        <rect
          x="2.5"
          y="2.5"
          width="6"
          height="6"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="11.5"
          y="2.5"
          width="6"
          height="6"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="2.5"
          y="11.5"
          width="6"
          height="6"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="11.5"
          y="11.5"
          width="6"
          height="6"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (name === "roles") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="size-6 text-[#C89B2C] transition-colors group-hover:text-[#E2BC4F]"
      >
        <path
          d="M10 2.5 16 5v4.3c0 3.7-2.5 6.5-6 8.2-3.5-1.7-6-4.5-6-8.2V5l6-2.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="m7.5 9.8 1.7 1.7 3.4-3.6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-6 text-[#C89B2C] transition-colors group-hover:text-[#E2BC4F]">
        <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1.75 17a5.25 5.25 0 0 1 10.5 0M13 3.4a3 3 0 0 1 0 5.8m1.1 2.6a5.25 5.25 0 0 1 4.15 5.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="size-6 text-[#C89B2C] transition-colors group-hover:text-[#E2BC4F]"
    >
      <circle
        cx="7"
        cy="6"
        r="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M1.75 17a5.25 5.25 0 0 1 10.5 0M13 3.4a3 3 0 0 1 0 5.8m1.1 2.6a5.25 5.25 0 0 1 4.15 5.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
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
  const { permissions } = useAuth();
  const [hoverExpanded, setHoverExpanded] = useState(false);

  // Sidebar temporarily expands when hovered while manually collapsed.
  const isExpanded = expanded || hoverExpanded || mobileOpen;

  return (
    <aside
      onMouseEnter={() => {
        if (
          !expanded &&
          window.matchMedia("(min-width: 1024px)").matches
        ) {
          setHoverExpanded(true);
        }
      }}
      onMouseLeave={() => setHoverExpanded(false)}
      className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-[280px] shrink-0 flex-col border-r border-[#334155] bg-[linear-gradient(180deg,#0F172A_0%,#172235_100%)] text-[#F8FAFC] shadow-[0_2px_12px_rgba(15,23,42,0.18)] transition-[width,transform] duration-250 ease-out lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 lg:shadow-none ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${isExpanded ? "lg:w-[260px]" : "lg:w-[80px]"}`}
    >
      {/* Decorative background */}
      <svg
        aria-hidden="true"
        viewBox="0 0 240 160"
        fill="none"
        className="pointer-events-none absolute bottom-16 right-[-42px] w-52 text-[#EAB308] opacity-[0.06]"
      >
        <path
          d="M10 100c35-67 71-67 107 0s72 67 108 0M10 124c35-67 71-67 107 0s72 67 108 0"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>

      {/* =========================================================
          LOGO HEADER
          Expanded  -> logo.png
          Collapsed -> logo-icon.png
          Hover     -> automatically expands and shows logo.png
          ========================================================= */}
      <div
        className={`relative flex min-h-[116px] items-center border-b border-[#334155] px-4 py-5 transition-all duration-200 ${
          isExpanded
            ? "justify-between gap-2"
            : "justify-center"
        }`}
      >
        <div
          className={`flex min-w-0 items-center transition-all duration-200 ${
            isExpanded ? "w-full justify-start" : "justify-center"
          }`}
        >
          {/* Full logo */}
          <Image
            src="/images/Hero-sidebarr.png"
            alt="Trust Forever Marriage Bureau"
            width={190}
            height={70}
            priority
            className={`h-auto max-h-[110px] w-[190px] shrink-0 object-contain transition-all duration-200 ${
              isExpanded
                ? "scale-100 opacity-100"
                : "pointer-events-none absolute scale-90 opacity-0"
            }`}
          />

          {/* Icon logo */}
          <Image
            src="/images/white-icon.png"
            alt="Trust Forever"
            width={44}
            height={44}
            priority
            className={`size-11 shrink-0 object-contain transition-all duration-200 ${
              isExpanded
                ? "pointer-events-none absolute scale-90 opacity-0"
                : "scale-100 opacity-100"
            }`}
          />
        </div>

        {/* Desktop collapse / expand button */}
        <button
          type="button"
          aria-label={
            isExpanded ? "Collapse sidebar" : "Expand sidebar"
          }
          title={
            isExpanded ? "Collapse sidebar" : "Expand sidebar"
          }
          onClick={() => {
            if (mobileOpen) {
              onMobileClose();
              return;
            }

            onExpandedChange(!expanded);
          }}
          className={`group hidden size-8 shrink-0 items-center justify-center rounded-full border border-[#475569] bg-[#1E293B] text-[#F8FAFC] shadow-sm transition hover:border-[#EAB308]/70 hover:bg-[#334155] lg:flex ${
            isExpanded
              ? ""
              : "absolute right-[-14px] top-1/2 z-10 -translate-y-1/2 bg-[#1E293B]"
          }`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="size-4 transition-transform duration-200"
          >
            <path
              d={
                isExpanded
                  ? "m12 4-6 6 6 6"
                  : "m8 4 6 6-6 6"
              }
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Mobile close button */}
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={onMobileClose}
            className="flex size-9 items-center justify-center rounded-full border border-[#475569] bg-[#1E293B] text-[#F8FAFC] lg:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="size-4"
            >
              <path
                d="m5 5 10 10M15 5 5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        className={`relative flex min-h-0 flex-1 flex-col gap-2 overflow-x-visible overflow-y-auto px-3 py-5 transition-all duration-200 ${
          isExpanded ? "" : "px-3"
        }`}
      >
        {navigation.filter((item) => !("permission" in item) || permissions.includes(item.permission)).map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              title={!isExpanded ? item.name : undefined}
              onClick={() => {
                if (mobileOpen) {
                  onMobileClose();
                }
              }}
              className={`group relative flex min-h-[54px] items-center gap-3 rounded-md border-l-2 text-base font-semibold tracking-[0.01em] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2BC4F] ${
                isActive
                  ? "border-[#E2BC4F] bg-[#29364A] text-white shadow-[0_3px_10px_rgba(0,0,0,0.18)]"
                  : "border-transparent text-[#E2E8F0] hover:border-[#D9B34A]/70 hover:bg-[#202D40] hover:text-white"
              } ${
                isExpanded
                  ? "justify-start px-4"
                  : "justify-center px-0"
              }`}
            >
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-md border transition-colors duration-200 ${isActive ? "border-[#C89B2C]/35 bg-[#C89B2C]/15" : "border-transparent bg-[#C89B2C]/[0.07] group-hover:border-[#C89B2C]/25 group-hover:bg-[#C89B2C]/[0.13]"}`}>
                <NavIcon name={item.icon} />
              </span>

              <span
                className={`whitespace-nowrap transition-all duration-200 ${
                  isExpanded
                    ? "opacity-100"
                    : "pointer-events-none absolute left-12 -translate-x-1 opacity-0"
                }`}
              >
                {item.name}
              </span>

              {/* Tooltip when sidebar is collapsed */}
              {!isExpanded && (
                <span className="pointer-events-none absolute left-[calc(100%+10px)] z-50 hidden whitespace-nowrap rounded-md border border-[#475569] bg-[#1E293B] px-3 py-2 text-sm font-semibold text-[#F8FAFC] shadow-md group-hover:block group-focus-visible:block">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Administrator */}
      <div
        className={`relative mx-3 mb-3 flex min-h-[64px] items-center rounded-lg border border-[#334155] bg-[#1E293B] py-3 shadow-[0_2px_8px_rgba(0,0,0,0.16)] transition-all duration-200 ${
          isExpanded
            ? "gap-3 px-3"
            : "justify-center px-1"
        }`}
      >
        <div
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#EAB308]/70 bg-[#0F172A] text-xs font-semibold text-[#F8FAFC]"
        >
          A
        </div>

        <div
          className={`min-w-0 transition-all duration-200 ${
            isExpanded
              ? "opacity-100"
              : "pointer-events-none absolute left-14 translate-x-1 opacity-0"
          }`}
        >
          <p className="whitespace-nowrap text-sm font-medium text-[#F8FAFC]">
            Administrator
          </p>

          <p className="mt-0.5 whitespace-nowrap text-xs text-[#94A3B8]">
            Trust Forever
          </p>
        </div>
      </div>
    </aside>
  );
}
