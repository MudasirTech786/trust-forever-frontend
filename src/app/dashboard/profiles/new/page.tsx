import Link from "next/link";
import ProfileForm from "@/components/profiles/ProfileForm";

export default function NewProfilePage() {
  return <div className="mx-auto w-full max-w-5xl space-y-6">
    <div><Link href="/dashboard/profiles" className="text-sm font-medium text-[#64748B] hover:text-[#0B2A4A]">← Profiles</Link><h1 className="mt-3 text-2xl font-semibold text-[#0B2A4A] sm:text-3xl">Add New Profile</h1><p className="mt-2 text-sm text-[#64748B]">Add personal, family, and partner preference details.</p></div>
    <ProfileForm />
  </div>;
}
