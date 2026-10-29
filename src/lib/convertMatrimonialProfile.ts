import { parseMatrimonialProfileText } from "@/lib/parseMatrimonialProfile";

export type ProfileFormatConversion = { text: string; warnings: string[] };

const clean = (value: string | undefined): string => value?.trim() ?? "";

export function convertMatrimonialProfileText(input: string, referenceDate = new Date()): ProfileFormatConversion {
  const parsed = parseMatrimonialProfileText(input, referenceDate);
  const data = parsed.data;
  const ageDobFields = [
    ...(parsed.ageExplicit && data.age ? [["Age", data.age] as [string, string]] : []),
    ...(parsed.dob ? [["DOB", parsed.dob] as [string, string]] : []),
  ];
  const otherDetails = clean(data.other_details);
  const contacts = [
    data.parents_whatsapp ? `Parents: ${data.parents_whatsapp}` : "",
    data.father_whatsapp ? `Father: ${data.father_whatsapp}` : "",
    data.mother_whatsapp ? `Mother: ${data.mother_whatsapp}` : "",
    data.whatsapp_number ? `Contact: ${data.whatsapp_number}` : "",
  ].filter(Boolean).join("\n");
  const fields: Array<[string, string]> = [
    ["Gender", clean(data.gender)],
    ["Marital Status", clean(data.marital_status)],
    ["Name", clean(data.name)],
    ["", ""],
    ["Height", clean(data.height)],
    ["Sect", clean(data.sect)],
    ["Caste", clean(data.caste)],
    ["Language", clean(data.language)],
    ["Qualifications", clean(data.qualification)],
    ["Name of educational institution", clean(data.educational_institution)],
    ["Job", clean(data.job)],
    ["Business", clean(data.business)],
    ["Income", clean(data.income)],
    ["Size of house", clean(data.house_size)],
    ["Society", clean(data.society)],
    ["City", clean(data.city)],
    ["Father's Name", clean(data.father_name)],
    ["Father occupation", clean(data.father_occupation)],
    ["Sisters", clean(data.sisters_count)],
    ["Married sis", clean(data.married_sisters_count)],
    ["Brothers", clean(data.brothers_count)],
    ["Married bro", clean(data.married_brothers_count)],
    ["Other Details", [otherDetails, clean(data.mother_details), clean(data.father_details), clean(data.brothers_details), clean(data.sisters_details)].filter(Boolean).join("\n")],
    ["Life partner Requirements", clean(data.partner_requirements)],
    ["Parents Whatsapp nbrs", contacts],
  ];
  const output = [
    "*Personal information*📝",
    ...fields.slice(0, 3).map(([label, value]) => `${label}: ${value}`),
    ...ageDobFields.map(([label, value]) => `${label}: ${value}`),
    ...fields.slice(4, 16).map(([label, value]) => `${label}: ${value}`),
    "",
    "*Family details*👨‍👩‍👧‍👦",
    ...fields.slice(16, 23).map(([label, value]) => `${label}: ${value}`),
    "",
    "*Life partner Requirements*❓",
    "Life partner Requirements:",
    fields[23][1],
    "",
    `${fields[24][0]}: ${fields[24][1]}`,
  ].join("\n");

  return {
    text: output,
    warnings: [
      ...parsed.warnings,
      ...parsed.unrecognized.map((line) => `Could not confidently identify: ${line}`),
    ],
  };
}
