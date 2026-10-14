"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useToast } from "@/components/ToastProvider";
import { ApiError, createProfile, updateProfile, type MatrimonialProfile } from "@/services/rolesPermissions";
import { parseMatrimonialProfileText, type MatrimonialProfileParseResult, type ProfileFormKey } from "@/lib/parseMatrimonialProfile";
import ProfilePhoto from "@/components/ProfilePhoto";

type Props = { profile?: MatrimonialProfile };
type Fields = Record<ProfileFormKey, string>;

const initialFields: Fields = {
  name: "", gender: "", marital_status: "", date_of_birth: "", height: "", sect: "", caste: "", language: "",
  qualification: "", educational_institution: "", employed: "", job: "", business: "", income: "", father_details: "", father_name: "", father_occupation: "", mother_details: "", other_details: "", house_size: "",
  society: "", city: "", sisters_count: "0", sisters_details: "", married_sisters_count: "0", brothers_count: "0",
  brothers_details: "", married_brothers_count: "0", partner_requirements: "", father_whatsapp: "", mother_whatsapp: "", whatsapp_number: "", parents_whatsapp: "",
};

const fieldsFromProfile = (profile: MatrimonialProfile): Fields => Object.keys(initialFields).reduce<Fields>((fields, key) => {
  const field = key as ProfileFormKey;
  const value = profile[field as keyof MatrimonialProfile];
  fields[field] = value == null ? "" : String(value);
  return fields;
}, { ...initialFields });

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-lg border border-[#E8E0D0] bg-white p-5 shadow-[0_2px_8px_rgba(23,32,51,0.035)] sm:p-6"><h2 className="mb-5 text-base font-semibold text-[#0B2A4A]">{title}</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div></section>;
}

function Field({ label, name, value, onChange, type = "text", required = false, options }: {
  label: string; name: string; value: string; onChange: (name: string, value: string) => void; type?: string; required?: boolean; options?: Array<[string, string]>;
}) {
  const className = "mt-1.5 min-h-11 w-full rounded-md border border-[#CBD5E1] bg-white px-3 text-sm text-[#172033] outline-none transition focus:border-[#C89B2C] focus:ring-2 focus:ring-[#C89B2C]/15";
  return <label className="block text-sm font-medium text-[#334155]">{label}{required && <span className="ml-1 text-[#9B342B]">*</span>}
    {options ? <select required={required} value={value} onChange={(event) => onChange(name, event.target.value)} className={className}><option value="">Select {label.toLowerCase()}</option>{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select>
      : <input required={required} type={type} value={value} onChange={(event) => onChange(name, event.target.value)} className={className} />}
  </label>;
}

function TextArea({ label, name, value, onChange, rows = 3 }: { label: string; name: string; value: string; onChange: (name: string, value: string) => void; rows?: number }) {
  return <label className="block text-sm font-medium text-[#334155]">{label}<textarea rows={rows} value={value} onChange={(event) => onChange(name, event.target.value)} className="mt-1.5 w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm text-[#172033] outline-none transition focus:border-[#C89B2C] focus:ring-2 focus:ring-[#C89B2C]/15" /></label>;
}

export default function ProfileForm({ profile }: Props) {
  const router = useRouter();
  const { notify } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<Fields>(profile ? fieldsFromProfile(profile) : initialFields);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(profile?.profile_picture_url ?? null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [entryMode, setEntryMode] = useState<"form" | "paste">("form");
  const [pastedText, setPastedText] = useState("");
  const [parseResult, setParseResult] = useState<MatrimonialProfileParseResult | null>(null);

  useEffect(() => () => { if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  function setField(name: string, value: string): void { setValues((current) => ({ ...current, [name]: value })); }

  function parsePastedProfile(): void {
    const result = parseMatrimonialProfileText(pastedText);
    setParseResult(result);
  }

  function fillFromParsedProfile(): void {
    if (!parseResult) return;
    setValues((current) => ({ ...current, ...parseResult.data }));
    setEntryMode("form");
    setError("");
  }

  function choosePhoto(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 2 * 1024 * 1024) {
      setError("Choose a JPG, PNG, or WebP image up to 2MB.");
      event.target.value = "";
      return;
    }
    setError("");
    setPhoto(file);
    setRemovePhoto(false);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSaving(true);
    setError("");
    const data = new FormData();
    Object.entries(values).forEach(([key, value]) => data.set(key, value));
    if (photo) data.set("profile_picture", photo);
    if (removePhoto) data.set("remove_profile_picture", "1");
    try {
      if (profile) await updateProfile(profile.id, data);
      else await createProfile(data);
      notify({ variant: "success", title: profile ? "Profile updated" : "Profile created", message: `${values.name.trim()}’s matrimonial profile has been saved.` });
      router.push("/dashboard/profiles");
    } catch (submitError) {
      const message = submitError instanceof ApiError ? submitError.message : "Please check your details and try again.";
      setError(message);
      notify({ variant: "error", title: "Unable to save profile", message });
    } finally {
      setSaving(false);
    }
  }

  return <form onSubmit={(event) => void handleSubmit(event)} className="mx-auto w-full max-w-5xl space-y-5">
    {!profile && <section className="rounded-lg border border-[#E8E0D0] bg-white p-5 shadow-[0_2px_8px_rgba(23,32,51,0.035)] sm:p-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Profile information entry method">
        <button type="button" role="tab" aria-selected={entryMode === "form"} onClick={() => setEntryMode("form")} className={`min-h-10 rounded-md px-4 text-sm font-medium ${entryMode === "form" ? "bg-[#0B2A4A] text-white" : "border border-[#CBD5E1] text-[#475569] hover:bg-[#F7F7F5]"}`}>Normal Form</button>
        <button type="button" role="tab" aria-selected={entryMode === "paste"} onClick={() => setEntryMode("paste")} className={`min-h-10 rounded-md px-4 text-sm font-medium ${entryMode === "paste" ? "bg-[#0B2A4A] text-white" : "border border-[#CBD5E1] text-[#475569] hover:bg-[#F7F7F5]"}`}>Paste &amp; Auto-Fill</button>
      </div>
      {entryMode === "paste" && <div className="mt-5 space-y-4" role="tabpanel">
        <div><h2 className="text-base font-semibold text-[#0B2A4A]">Fill the form from profile text</h2><p className="mt-1 text-sm leading-6 text-[#64748B]">Paste the profile details below. We’ll organize what we recognize so you can review and edit everything before saving.</p></div>
        <textarea value={pastedText} onChange={(event) => { setPastedText(event.target.value); setParseResult(null); }} rows={12} placeholder="Paste matrimonial profile information here..." className="w-full rounded-md border border-[#CBD5E1] bg-white px-3.5 py-3 text-sm leading-6 text-[#172033] outline-none focus:border-[#C89B2C] focus:ring-2 focus:ring-[#C89B2C]/15" />
        <button type="button" onClick={parsePastedProfile} disabled={!pastedText.trim()} className="min-h-10 rounded-md bg-[#0B2A4A] px-4 text-sm font-medium text-white hover:bg-[#123E68] disabled:cursor-not-allowed disabled:opacity-50">Parse &amp; Fill Form</button>
        {parseResult && <div className="space-y-3 rounded-md border border-[#E8E0D0] bg-[#FBF8EF] p-4" aria-live="polite">
          <div><h3 className="text-sm font-semibold text-[#0B2A4A]">Profile information detected</h3><p className="mt-1 text-sm text-[#64748B]">{parseResult.detected.length ? parseResult.detected.join(" · ") : "No recognized profile fields yet."}</p></div>
          {parseResult.missingRequired.length > 0 && <p className="text-sm text-[#8F5D14]">Still needed: {parseResult.missingRequired.join(", ")}. You can fill these in after applying the recognized details.</p>}
          {parseResult.warnings.map((warning) => <p key={warning} className="text-sm text-[#8F5D14]">{warning}</p>)}
          {parseResult.unrecognized.length > 0 && <div><h4 className="text-sm font-medium text-[#334155]">Unrecognized information</h4><pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words text-sm text-[#64748B]">{parseResult.unrecognized.join("\n\n")}</pre></div>}
          <div className="flex flex-wrap gap-2"><button type="button" onClick={fillFromParsedProfile} disabled={Object.keys(parseResult.data).length === 0} className="min-h-10 rounded-md bg-[#0B2A4A] px-4 text-sm font-medium text-white hover:bg-[#123E68] disabled:cursor-not-allowed disabled:opacity-50">Fill Form</button><button type="button" onClick={() => { setParseResult(null); setEntryMode("form"); }} className="min-h-10 rounded-md border border-[#CBD5E1] px-4 text-sm font-medium text-[#475569] hover:bg-white">Cancel</button></div>
        </div>}
      </div>}
    </section>}
    {(entryMode === "form" || profile) && <>
    <div className="rounded-lg border border-[#E8E0D0] bg-white p-5 shadow-[0_2px_8px_rgba(23,32,51,0.035)] sm:p-6">
      <h2 className="text-base font-semibold text-[#0B2A4A]">Profile Photo</h2>
      <div className="mt-4 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div className="relative flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E8E0D0] bg-[#FBF8EF] text-3xl font-semibold text-[#9A7625]">
          <ProfilePhoto src={preview} alt="Matrimonial profile preview" fill sizes="128px" className="object-cover" />
        </div>
        <div><p className="text-sm text-[#64748B]">Upload a clear JPG, PNG, or WebP photo. Maximum file size: 2MB.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} className="sr-only" aria-label="Choose profile photo" />
            <button type="button" onClick={() => fileRef.current?.click()} className="min-h-10 rounded-md bg-[#0B2A4A] px-4 text-sm font-medium text-white transition hover:bg-[#123E68]">{preview ? "Change photo" : "Upload photo"}</button>
            {preview && <button type="button" onClick={() => { setPreview(null); setPhoto(null); setRemovePhoto(Boolean(profile)); if (fileRef.current) fileRef.current.value = ""; }} className="min-h-10 rounded-md border border-[#CBD5E1] px-4 text-sm font-medium text-[#475569] transition hover:bg-[#F7F7F5]">Remove</button>}
          </div>
        </div>
      </div>
    </div>

    <Section title="Personal Information">
      <Field label="Name" name="name" value={values.name} onChange={setField} required />
      <Field label="Gender" name="gender" value={values.gender} onChange={setField} options={[["female", "Female"], ["male", "Male"]]} required />
      <Field label="Marital Status" name="marital_status" value={values.marital_status} onChange={setField} options={[["unmarried", "Unmarried"], ["married", "Married"], ["divorced", "Divorced"], ["widowed", "Widowed"]]} required />
      <div><Field label="Date of Birth" name="date_of_birth" value={values.date_of_birth} onChange={setField} type="date" required />{parseResult?.warnings.map((warning) => <p key={warning} className="mt-1.5 text-xs leading-5 text-[#8F5D14]">{warning}</p>)}</div>
      <Field label="Height" name="height" value={values.height} onChange={setField} />
      <Field label="Sect" name="sect" value={values.sect} onChange={setField} />
      <Field label="Caste" name="caste" value={values.caste} onChange={setField} />
      <Field label="Language" name="language" value={values.language} onChange={setField} />
      <Field label="Qualification" name="qualification" value={values.qualification} onChange={setField} />
      <Field label="Educational Institution" name="educational_institution" value={values.educational_institution} onChange={setField} />
      <Field label="Employment" name="employed" value={values.employed} onChange={setField} options={[["1", "Employed"], ["0", "Not employed"]]} />
      <Field label="Job" name="job" value={values.job} onChange={setField} />
      <Field label="Business" name="business" value={values.business} onChange={setField} />
      <Field label="Income" name="income" value={values.income} onChange={setField} />
    </Section>

    <Section title="Family Details">
      <Field label="Father's Name" name="father_name" value={values.father_name} onChange={setField} />
      <Field label="Father Occupation" name="father_occupation" value={values.father_occupation} onChange={setField} />
      {values.father_details && <div className="sm:col-span-2"><TextArea label="Existing Father Details" name="father_details" value={values.father_details} onChange={setField} /></div>}
      <TextArea label="Mother" name="mother_details" value={values.mother_details} onChange={setField} />
      <Field label="House Size" name="house_size" value={values.house_size} onChange={setField} />
      <Field label="Society" name="society" value={values.society} onChange={setField} />
      <Field label="City" name="city" value={values.city} onChange={setField} />
      <Field label="Sisters" name="sisters_count" value={values.sisters_count} onChange={setField} type="number" />
      <TextArea label="Sisters Details" name="sisters_details" value={values.sisters_details} onChange={setField} />
      <Field label="Married Sisters" name="married_sisters_count" value={values.married_sisters_count} onChange={setField} type="number" />
      <Field label="Brothers" name="brothers_count" value={values.brothers_count} onChange={setField} type="number" />
      <TextArea label="Brothers Details" name="brothers_details" value={values.brothers_details} onChange={setField} />
      <Field label="Married Brothers" name="married_brothers_count" value={values.married_brothers_count} onChange={setField} type="number" />
      <div className="sm:col-span-2"><TextArea label="Other Details" name="other_details" value={values.other_details} onChange={setField} rows={4} /></div>
    </Section>

    <Section title="Life Partner Requirements"><div className="sm:col-span-2"><TextArea label="Partner Requirements" name="partner_requirements" value={values.partner_requirements} onChange={setField} rows={5} /></div></Section>
    <Section title="Contact Numbers">
      <Field label="WhatsApp Number" name="whatsapp_number" value={values.whatsapp_number} onChange={setField} type="tel" />
      <Field label="Parents WhatsApp Number" name="parents_whatsapp" value={values.parents_whatsapp} onChange={setField} type="tel" />
      <Field label="Father’s WhatsApp" name="father_whatsapp" value={values.father_whatsapp} onChange={setField} type="tel" />
      <Field label="Mother’s WhatsApp" name="mother_whatsapp" value={values.mother_whatsapp} onChange={setField} type="tel" />
    </Section>

    {error && <p role="alert" className="rounded-md border border-[#E8C7C2] bg-[#FBF0EE] px-4 py-3 text-sm text-[#8F3028]">{error}</p>}
    <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
      <Link href="/dashboard/profiles" className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#CBD5E1] px-5 text-sm font-medium text-[#475569] transition hover:bg-[#F7F7F5]">Cancel</Link>
      <button type="submit" disabled={saving} className="min-h-11 rounded-md bg-[#0B2A4A] px-5 text-sm font-semibold text-white transition hover:bg-[#123E68] disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving profile…" : profile ? "Save Changes" : "Save Profile"}</button>
    </div>
    </>}
  </form>;
}
