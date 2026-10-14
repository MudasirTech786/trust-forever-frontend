export default function ProfileActionIcon({ action }: { action: "view" | "edit" | "delete" }) {
  if (action === "view") return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-[18px]" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.6" /></svg>;
  if (action === "edit") return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-[18px]" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m14 5 5 5M4 20l4.1-.8L19 8.3a2.1 2.1 0 0 0-3-3L5.1 16.2 4 20Z" /><path d="M13 20h7" /></svg>;
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-[18px]" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3" /></svg>;
}
