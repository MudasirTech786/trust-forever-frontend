"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import ProfileForm from "@/components/profiles/ProfileForm";
import { ApiError, getProfile, type MatrimonialProfile } from "@/services/rolesPermissions";

export default function ProfileEditor() {
  const { id: rawId } = useParams<{ id: string }>();
  const id = Number(rawId);
  const { permissions } = useAuth();
  const [profile, setProfile] = useState<MatrimonialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let current = true;
    if (!Number.isInteger(id) || id < 1) {
      const timeoutId = window.setTimeout(() => { setError("Profile not found."); setLoading(false); }, 0);
      return () => { current = false; window.clearTimeout(timeoutId); };
    }
    if (!permissions.includes("profiles.view") || !permissions.includes("profiles.edit")) return;
    getProfile(id).then((result) => { if (current) setProfile(result.profile); }).catch((loadError: unknown) => {
      if (current) setError(loadError instanceof ApiError ? loadError.message : "Unable to load this profile.");
    }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [id, permissions]);

  if (!permissions.includes("profiles.edit")) return <p className="rounded-lg border border-[#E5E7EB] bg-white p-6 text-sm text-[#64748B]">Your account does not have permission to edit profiles.</p>;
  if (loading) return <div role="status" className="mx-auto h-80 max-w-5xl animate-pulse rounded-lg border border-[#E8E0D0] bg-white" />;
  if (error || !profile) return <section className="rounded-lg border border-[#E8C7C2] bg-white p-6"><h1 className="font-semibold text-[#0B2A4A]">Unable to open profile</h1><p className="mt-2 text-sm text-[#64748B]">{error || "Profile not found."}</p></section>;

  return <div className="mx-auto w-full max-w-5xl space-y-6"><div><h1 className="text-2xl font-semibold text-[#0B2A4A] sm:text-3xl">Edit Profile</h1><p className="mt-2 text-sm text-[#64748B]">Update {profile.name}’s matrimonial profile.</p><p className="mt-1 text-sm font-semibold text-[#9A7625]">Profile ID: <span className="select-all">{profile.profile_id}</span></p></div><ProfileForm profile={profile} /></div>;
}
