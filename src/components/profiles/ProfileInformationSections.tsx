import type { MatrimonialProfile } from "@/services/rolesPermissions";

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#E8E0D0] bg-white p-4 shadow-[0_2px_8px_rgba(23,32,51,0.035)] sm:p-6">
      <h2 className="mb-4 border-b border-[#F0ECE3] pb-2 text-base font-semibold text-[#0B2A4A]">{title}</h2>
      <div className="grid min-w-0 gap-x-6 gap-y-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-[#94A3B8]">{label}</p>
      <p className="mt-1 break-words whitespace-pre-wrap text-sm leading-6 text-[#334155]">{value}</p>
    </div>
  );
}

export default function ProfileInformationSections({
  profile,
}: {
  profile: MatrimonialProfile;
}) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <DetailSection title="Personal Information">
        <Detail label="Gender" value={profile.gender ? profile.gender[0].toUpperCase() + profile.gender.slice(1) : null} />
        <Detail label="Marital Status" value={profile.marital_status ? profile.marital_status[0].toUpperCase() + profile.marital_status.slice(1) : null} />
        <Detail label="Age" value={profile.age === null ? null : `${profile.age} years`} />
        <Detail label="Height" value={profile.height} />
        <Detail label="Sect" value={profile.sect} />
        <Detail label="Caste" value={profile.caste} />
        <Detail label="Language" value={profile.language} />
        <Detail label="Qualification" value={profile.qualification} />
        <Detail label="Educational Institution" value={profile.educational_institution} />
        <Detail label="Employment" value={profile.employed === null ? null : profile.employed ? "Employed" : "Not employed"} />
        <Detail label="Job" value={profile.job} />
        <Detail label="Business" value={profile.business} />
        <Detail label="Income" value={profile.income} />
      </DetailSection>
      <DetailSection title="Family Details">
        <Detail label="Father's Name" value={profile.father_name} />
        <Detail label="Father Occupation" value={profile.father_occupation} />
        <Detail label="Existing Father Details" value={profile.father_details} />
        <Detail label="Mother" value={profile.mother_details} />
        <Detail label="House Size" value={profile.house_size} />
        <Detail label="Society" value={profile.society} />
        <Detail label="City" value={profile.city} />
        <Detail label="Sisters" value={profile.sisters_count} />
        <Detail label="Sisters Details" value={profile.sisters_details} />
        <Detail label="Married Sisters" value={profile.married_sisters_count} />
        <Detail label="Brothers" value={profile.brothers_count} />
        <Detail label="Brothers Details" value={profile.brothers_details} />
        <Detail label="Married Brothers" value={profile.married_brothers_count} />
        <Detail label="Other Details" value={profile.other_details} />
      </DetailSection>
      <DetailSection title="Life Partner Requirements">
        <div className="sm:col-span-2"><Detail label="Partner Requirements" value={profile.partner_requirements} /></div>
      </DetailSection>
      <DetailSection title="Contact Numbers">
        <Detail label="WhatsApp Number" value={profile.whatsapp_number} />
        <Detail label="Parents WhatsApp Number" value={profile.parents_whatsapp} />
        <Detail label="Father's WhatsApp" value={profile.father_whatsapp} />
        <Detail label="Mother's WhatsApp" value={profile.mother_whatsapp} />
      </DetailSection>
    </div>
  );
}
