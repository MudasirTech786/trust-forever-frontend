import Link from "next/link";

export default function EditProfilePage() {
  return (
    <div className="mx-auto flex min-h-[min(70vh,720px)] w-full max-w-3xl items-center justify-center">
      <section className="relative w-full overflow-hidden border border-[#E8E0D0] bg-white px-6 py-12 text-center shadow-[0_8px_32px_rgba(23,32,51,0.06)] sm:px-12 sm:py-16">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0B2A4A] via-[#C89B2C] to-[#0B2A4A]" />
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-[#E8E0D0] bg-[#FBF8EF] text-[#9A7625]">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-7">
            <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5.5 20a6.5 6.5 0 0 1 13 0m-1-12.5 2-2m-1.5 3.5 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#9A7625]">Administrator settings</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#0B2A4A] sm:text-3xl">A more personal space, coming soon</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#64748B] sm:text-base">
          Profile editing is being prepared. Soon you&apos;ll be able to update your administrator details and account preferences here.
        </p>
        <Link href="/dashboard" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#0B2A4A] px-5 text-sm font-medium text-white transition hover:bg-[#123E68] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C89B2C]">
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-4">
            <path d="m12 4-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to dashboard
        </Link>
      </section>
    </div>
  );
}