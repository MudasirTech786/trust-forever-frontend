export type ProfileFormKey =
  | "name" | "gender" | "marital_status" | "age" | "height" | "sect" | "caste"
  | "language" | "qualification" | "educational_institution" | "employed" | "job" | "business" | "income"
  | "father_details" | "mother_details" | "house_size" | "society" | "city" | "sisters_count" | "sisters_details"
  | "father_name" | "father_occupation" | "other_details"
  | "married_sisters_count" | "brothers_count" | "brothers_details" | "married_brothers_count"
  | "partner_requirements" | "father_whatsapp" | "mother_whatsapp" | "whatsapp_number" | "parents_whatsapp";

export type MatrimonialProfileParseResult = {
  data: Partial<Record<ProfileFormKey, string>>;
  detected: string[];
  unrecognized: string[];
  warnings: string[];
  dob?: string;
  ageExplicit?: boolean;
};

type Definition = { key: ProfileFormKey; label: string };
const definitions = new Map<string, Definition>();
const normalizeLabel = (value: string): string => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[’‘`]/g, "'").replace(/[^\p{L}\p{N}']+/gu, " ").trim().toLowerCase().replace(/\s+/g, " ");
const add = (key: ProfileFormKey, label: string, aliases: string[]): void => { for (const alias of aliases) definitions.set(normalizeLabel(alias), { key, label }); };

add("name", "Name", ["name", "candidate name"]);
add("gender", "Gender", ["gender", "sex"]);
add("marital_status", "Marital status", ["marital status", "martial status", "marital", "martial", "single married widow divorced", "single/married/widow/divorced"]);
add("age", "Age", ["age", "candidate age", "candidate's age", "profile age", "age of candidate", "bride age", "groom age", "boy age", "girl age"]);
add("height", "Height", ["height", "hight"]);
add("sect", "Sect", ["sect", "maslak", "sect maslak", "maslak/sect", "school of thought"]);
add("caste", "Caste", ["cast", "caste"]);
add("language", "Language", ["language", "mother tongue", "mother lang", "lang"]);
add("qualification", "Qualification", ["qualification", "qualifications", "education", "education details"]);
add("educational_institution", "Educational institution", ["educational institution", "name of educational institution", "college university", "college", "university", "religious education"]);
add("employed", "Employment", ["employed", "employment"]);
add("job", "Job", ["job", "occupation", "candidate occupation", "candidate's occupation", "job business", "job bussines", "business job"]);
add("business", "Business", ["business", "candidate business", "job/business", "job / business"]);
add("income", "Income", ["income", "monthly income", "source of income", "income if the profile is male", "income if profile is male"]);
add("father_name", "Father name", ["father name", "father's name"]);
add("father_occupation", "Father occupation", ["father occupation", "father's occupation", "father job", "father job/business", "father job business", "father profession"]);
add("father_details", "Father details", ["father", "father details", "father name and profession", "father's name and profession", "father's name profession"]);
add("mother_details", "Mother", ["mother", "mother's name", "mother name", "mother occupation", "mother's occupation", "mother job", "mother job/business", "mother profession", "mother name and profession", "mother's name profession"]);
add("house_size", "House size", ["house size", "size of house", "size"]);
add("society", "Society", ["society", "area", "area of residence and city", "area of residence & city", "residence", "address", "current address", "location"]);
add("city", "City", ["city", "city you lived", "current city", "home city"]);
add("sisters_count", "Sisters", ["sisters", "sister", "sisters count", "sibling sisters"]);
add("sisters_details", "Sisters details", ["sisters details", "sibling details"]);
add("married_sisters_count", "Married sisters", ["married sisters", "married sis"]);
add("brothers_count", "Brothers", ["brothers", "brother", "brothers count", "sibling brothers"]);
add("brothers_details", "Brothers details", ["brothers details", "siblings details", "siblings", "siblings detail"]);
add("married_brothers_count", "Married brothers", ["married brothers", "married bro"]);
add("other_details", "Other details", ["other details", "family details", "family information", "family detail", "other properties", "house owned or rental", "home own or rent", "own house rented house", "house own rent", "house own", "house", "home", "financial status", "disability", "religion", "nationality", "country", "social status", "car bike", "car/bike", "contact person", "complexion"]);
add("other_details", "Other details", ["married", "other properties if any", "home town", "hometown"]);
add("partner_requirements", "Partner requirements", ["requirements", "requirement", "demands", "any demands", "any other demand", "partner requirements", "life partner requirements", "life partner requirement", "looking for overseas"]);
add("father_whatsapp", "Father's WhatsApp", ["father whatsapp", "father phone", "father phone number", "father contact number"]);
add("mother_whatsapp", "Mother's WhatsApp", ["mother whatsapp", "mother phone", "mother phone number", "mother contact number"]);
add("whatsapp_number", "WhatsApp number", ["whatsapp number", "whatsapp nbr", "personal whatsapp number", "contact no", "contact number", "contact numbers", "cell number", "phone number", "mobile number", "candidate contact"]);
add("parents_whatsapp", "Parents WhatsApp", ["parents whatsapp", "parents whatsapp number", "parents whatsapp nbrs", "parents whatsapp nbr", "parents number", "parent number", "parents phone", "parents contact number"]);

const headings = new Set(["personal information", "personal details", "address", "requirements", "your requirements", "candidate info", "candidate s info", "candidates info", "family details", "family detail", "family information", "parents details", "home details", "residence details", "residance details", "education details", "occupation detail", "occupation details", "religion details", "life partner requirements", "partner requirements", "parents whatsapp numbers", "parent whatsapp numbers", "whatsapp contacts"]);
const sectionAliases: Record<string, ProfileFormKey | null> = { "life partner requirements": "partner_requirements", "partner requirements": "partner_requirements", requirements: "partner_requirements", "your requirements": "partner_requirements" };
// Keep DOB recognition tied to a complete field label. normalizeLabel folds
// case and turns spacing, punctuation, hyphens, and underscores into spaces.
const dobLabels = new Set(["dob", normalizeLabel("date of birth"), normalizeLabel("birth date")]);

function parseDate(value: string): { date: string | null; ambiguous: boolean } {
  const trimmed = value.trim().replace(/^as\s+per\s+id\s+card\s*[:, -]*/i, "");
  let match = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(trimmed);
  let year: number, month: number, day: number;
  if (match) { year = +match[1]; month = +match[2]; day = +match[3]; }
  else {
    match = /^(\d{1,2})\s*[-/.]\s*(\d{1,2})\s*[-/.]\s*(\d{4})$/.exec(trimmed);
    if (match) {
      const first = +match[1], second = +match[2];
      year = +match[3];
      if (first <= 12 && second <= 12) return { date: null, ambiguous: true };
      if (first > 12 && second <= 12) { day = first; month = second; }
      else if (second > 12 && first <= 12) { month = first; day = second; }
      else return { date: null, ambiguous: false };
    }
    else {
      match = /^(\d{1,2})\s*[-/. ]\s*([a-z]+)\s*[-/. ]\s*(\d{4})$/i.exec(trimmed);
      if (!match) return { date: null, ambiguous: false };
      day = +match[1]; year = +match[3];
      month = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"].findIndex((m) => m === match![2].toLowerCase() || (match![2].length >= 3 && m.startsWith(match![2].toLowerCase()))) + 1;
      if (!month) return { date: null, ambiguous: false };
    }
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  const valid = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return { date: valid ? `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null, ambiguous: false };
}
type DobAgeResult = { age: string | null; ambiguous: boolean; valid: boolean };
function ageFromDate(value: string, today = new Date()): DobAgeResult {
  const parsed = parseDate(value);
  let year: number, month: number, day: number | undefined;
  if (parsed.date) [year, month, day] = parsed.date.split("-").map(Number);
  else {
    if (parsed.ambiguous) return { age: null, ambiguous: true, valid: false };
    const trimmed = value.trim();
    const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    let partial: RegExpExecArray | null;
    let namedMonth = "";
    if ((partial = /^(\d{1,2})\s*[-/.]\s*(\d{4})$/.exec(trimmed))) {
      month = +partial[1]; year = +partial[2];
    } else if ((partial = /^(\d{4})\s*[-/.]\s*(\d{1,2})$/.exec(trimmed))) {
      year = +partial[1]; month = +partial[2];
    } else if ((partial = /^([a-z]+)\s+(\d{4})$/i.exec(trimmed))) {
      namedMonth = partial[1].toLowerCase(); year = +partial[2];
      month = monthNames.findIndex((name) => name === namedMonth || (namedMonth.length >= 3 && name.startsWith(namedMonth))) + 1;
    } else if ((partial = /^(\d{4})$/.exec(trimmed))) {
      year = +partial[1]; month = 0;
    } else return { age: null, ambiguous: false, valid: false };
    if (year < 1 || year > today.getFullYear() || (month !== 0 && (month < 1 || month > 12))) return { age: null, ambiguous: false, valid: false };
    if (month === 0) return { age: null, ambiguous: false, valid: true };
    if (today.getMonth() + 1 === month) return { age: null, ambiguous: false, valid: true };
    const partialAge = today.getFullYear() - year - (today.getMonth() + 1 < month ? 1 : 0);
    return { age: partialAge >= 0 ? String(partialAge) : null, ambiguous: false, valid: partialAge >= 0 };
  }
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  let age = currentYear - year;
  if (currentMonth < month || (currentMonth === month && currentDay < (day ?? 1))) age -= 1;
  const valid = age >= 0 && year <= currentYear;
  return { age: valid ? String(age) : null, ambiguous: false, valid };
}

function parseSiblingCount(value: string): { count: string; details?: string } {
  const match = /^\s*(\d+)\s*(?:\((.*)\))?\s*$/.exec(value);
  if (match) return { count: match[1], ...(match[2] ? { details: match[2].trim() } : {}) };
  return { count: value.trim() };
}
function parseCombinedSiblingCounts(value: string, gender?: string): { sisters?: string; brothers?: string } {
  const match = /(?:(\d+)\s*(?:sisters?|sis\b))?\s*[,/&+and]*\s*(?:(\d+)\s*(?:brothers?|bros?\b))?/i.exec(value);
  if (!match || (!match[1] && !match[2])) return {};
  let sisters = match[1] ? Number(match[1]) : undefined;
  let brothers = match[2] ? Number(match[2]) : undefined;
  if (/including\s+me/i.test(value)) {
    if (gender === "female" && sisters !== undefined) sisters = Math.max(0, sisters - 1);
    if (gender === "male" && brothers !== undefined) brothers = Math.max(0, brothers - 1);
  }
  return { ...(sisters === undefined ? {} : { sisters: String(sisters) }), ...(brothers === undefined ? {} : { brothers: String(brothers) }) };
}
function isReferenceLine(line: string): boolean { return /^(?:(?:profile\s*)?(?:no\.?|number|id|ref(?:erence)?(?:\s*(?:no\.?|number))?)|imb)\s*[:#-]?\s*[a-z0-9-]+$/i.test(line.trim()); }
function stripDecorations(raw: string): string { return raw.replace(/^\s*(?:(?:\d+[\uFE0F]?\u20E3)|(?:[-*•▪►▶▷▲△🔹🔸🔺🔻]+)|(?:\d+[.)])|(?:[①-⑳❶-❿]+)|(?:\*\*))+\s*/u, "").replace(/\*\*/g, "").trim(); }

function prepareLine(raw: string): string {
  let line = raw.replace(/\\(?=\*)/g, "");
  if (/^\s*\d/.test(line) && line.includes("*")) line = line.slice(line.indexOf("*"));
  else if (/^\s*\d/.test(line) && /(?:☎|â˜Ž)/.test(line)) line = line.slice(line.search(/(?:☎|â˜Ž)/));
  line = line.replace(/\*/g, "").replace(/^\s*\d{1,2}\s*:\s*/, "");
  line = line.replace(/^\s*(?:➡️|➤|➔|→|▶|➢)\s*/u, "");
  return stripDecorations(line).replace(/^\s*(?:☎️?|â˜Ž)\s*/u, "").replace(/\\+$/, "").trim();
}

function splitField(line: string): { rawLabel: string; value: string } {
  const cleaned = stripDecorations(line.replace(/\\(?=\*)/g, "").replace(/\*+/g, "").trim()).replace(/^\d+\s*[.)]?\s*/, "");
  const colon = cleaned.search(/[:：=]/);
  if (colon >= 0) return { rawLabel: cleaned.slice(0, colon).trim(), value: cleaned.slice(colon + 1).trim() };

  const markers = [...line.matchAll(/\*+([^*]+)\*+/g)];
  if (markers.length && /^\s*\*/.test(line)) {
    const rawLabel = markers.map((match) => match[1].trim()).join(" ");
    const last = markers[markers.length - 1];
    return { rawLabel, value: line.slice(last.index! + last[0].length).trim() };
  }

  const normalized = normalizeLabel(cleaned);
  // DOB is also commonly pasted without a colon (for example, "Date of birth 25/12/1993").
  // Match only a complete leading DOB label so similar text in prose is left alone.
  for (const alias of [...dobLabels].sort((a, b) => b.length - a.length)) {
    if (normalized !== alias && !normalized.startsWith(`${alias} `)) continue;
    for (let end = 1; end <= cleaned.length; end += 1) {
      if (normalizeLabel(cleaned.slice(0, end)) === alias && (end === cleaned.length || /[\s,:;=\-]/.test(cleaned[end]))) {
        return { rawLabel: cleaned.slice(0, end).trim(), value: cleaned.slice(end).replace(/^[\s,:;=\-]+/, "").trim() };
      }
    }
  }
  for (const alias of [...definitions.keys()].sort((a, b) => b.length - a.length)) {
    if (normalized !== alias && !normalized.startsWith(`${alias} `)) continue;
    for (let end = 1; end <= cleaned.length; end += 1) {
      if (normalizeLabel(cleaned.slice(0, end)) === alias && (end === cleaned.length || /[\s,;:-]/.test(cleaned[end]))) {
        return { rawLabel: cleaned.slice(0, end).trim(), value: cleaned.slice(end).replace(/^[\s,:;-]+/, "").trim() };
      }
    }
  }
  return { rawLabel: cleaned, value: "" };
}

function parseContactLine(line: string): { key: ProfileFormKey; value: string } | null {
  const match = /^\s*(\+?\d[\d\s().-]{6,}\d)\s*\(([^)]+)\)\s*$/.exec(line);
  if (!match) return null;
  const contactType = normalizeLabel(match[2]);
  if (contactType.includes("mother")) return { key: "mother_whatsapp", value: match[1].trim() };
  if (contactType.includes("father")) return { key: "father_whatsapp", value: match[1].trim() };
  if (contactType.includes("parent")) return { key: "parents_whatsapp", value: match[1].trim() };
  if (contactType.includes("sister")) return { key: "whatsapp_number", value: match[1].trim() };
  return null;
}

function extractPhoneNumbers(value: string): string[] {
  const matches = value.match(/(?:\+?92[\s().-]*3\d{2}[\s().-]*\d{7}|0?3\d{2}[\s().-]*\d{7})/g) ?? [];
  return matches.map((phone) => phone.replace(/[\s().-]+/g, " ").trim());
}

export function parseMatrimonialProfileText(text: string, referenceDate = new Date()): MatrimonialProfileParseResult {
  const data: Partial<Record<ProfileFormKey, string>> = {};
  const detected = new Set<string>(), unrecognized: string[] = [], warnings: string[] = [];
  const normalizedText = text
    .replace(/\\(?=\r?\n)/g, "")
    .replace(/\\r\\n|\\n|\\r/g, "\n")
    .replace(/\\(?=\s*-{3,}(?:\\|$))/g, "\n")
    .replace(/\\(?=\s*(?:(?:\\?\*?\s*)?\d{1,2}\s*:|PERSONAL\s+INFORMATION\b|ADDRESS\b|REQUIREMENTS\b))/gi, "\n")
    .replace(/\r\n?/g, "\n");
  const lines = normalizedText.split("\n");
  let currentKey: ProfileFormKey | null = null, unknown = "";
  let whatsappSection = false, requirementsSection = false, genericContactBlock = false, educationSection = false;
  let explicitAge: string | undefined, derivedAge: string | undefined, dob: string | undefined;
  const flushUnknown = (): void => { if (unknown.trim()) unrecognized.push(unknown.trim()); unknown = ""; };
  const append = (key: ProfileFormKey, value: string): void => { if (value) data[key] = data[key] ? `${data[key]}\n${value}` : value; };
  const assignPhone = (phone: string, requestedKey?: ProfileFormKey, uncertainOwner = false): void => {
    const contactKeys: ProfileFormKey[] = ["whatsapp_number", "parents_whatsapp", "father_whatsapp", "mother_whatsapp"];
    const key = requestedKey && !data[requestedKey] ? requestedKey : contactKeys.find((candidate) => !data[candidate]);
    if (!key) { warnings.push(`Additional contact number “${phone}” could not fit in an unused contact field.`); return; }
    data[key] = phone;
    if (requestedKey && key !== requestedKey) warnings.push(`Contact number “${phone}” was kept separately in ${key}; its owner is unclear.`);
    else if (uncertainOwner) warnings.push(`Contact number “${phone}” was kept separately in ${key}; its owner is unclear.`);
  };

  for (const rawLine of lines) {
    const line = prepareLine(rawLine);
    if (!line || isReferenceLine(line) || /^(?:i\s+pay\s+witness|i\s+hereby\s+declare|declaration\b|witness\b)/i.test(line)) continue;
    const contactMatch = /^\s*(father(?:'s)?|mother(?:'s)?|parents?|big\s+sister|sister|contact(?:\s+no\.?)?|whatsapp|cell\s+number|mobile\s+number|phone\s+number|parents\s+whatsapp\s+nbrs?)\s*[:：=\-]?\s*(.*)$/i.exec(line);
    if (contactMatch) {
      const label = normalizeLabel(contactMatch[1]);
      const value = contactMatch[2];
      const nestedGeneric = /(?:^|\b)contact(?:\s+no\.?)?\s*[:：=\-]/i.test(value);
      const key = label.startsWith("father") ? "father_whatsapp" : label.startsWith("mother") ? "mother_whatsapp" : label.startsWith("parent") ? "parents_whatsapp" : label === "big sister" || label === "sister" ? "whatsapp_number" : undefined;
      const phones = extractPhoneNumbers(value);
      if (label.startsWith("parent") || label === "contact" || label.startsWith("whatsapp") || label === "cell number" || label === "mobile number" || label === "phone number") genericContactBlock = true;
      if (phones.length) phones.forEach((phone, index) => assignPhone(phone, nestedGeneric ? undefined : index === 0 ? key : undefined, nestedGeneric || (!key && index > 0)));
      else if (!value.trim()) genericContactBlock = true;
      if (phones.length || !value.trim()) { currentKey = key ?? "parents_whatsapp"; continue; }
    }
    const barePhones = extractPhoneNumbers(line);
    if (barePhones.length && (genericContactBlock || ["whatsapp_number", "parents_whatsapp", "father_whatsapp", "mother_whatsapp"].includes(currentKey ?? ""))) {
      barePhones.forEach((phone) => assignPhone(phone, undefined, genericContactBlock));
      continue;
    }
    const phone = parseContactLine(line);
    if (phone) {
      if (phone.key === "other_details") append(phone.key, phone.value);
      else append(phone.key, phone.value);
      currentKey = null;
      detected.add(phone.key === "mother_whatsapp" ? "Mother's WhatsApp" : phone.key === "father_whatsapp" ? "Father's WhatsApp" : phone.key === "parents_whatsapp" ? "Parents WhatsApp" : "WhatsApp number");
      continue;
    }
    const parsedField = splitField(line);
    let rawLabel = parsedField.rawLabel;
    const value = parsedField.value;
    const normalizedWholeLine = normalizeLabel(line);
    const numberedHeading = /^\d/.test(normalizedWholeLine) && [...headings].find((heading) => normalizedWholeLine.endsWith(heading));
    if (numberedHeading && !value) rawLabel = numberedHeading;
    const hasSeparator = /[:：=]/.test(line);
    const normalizedRawLabel = normalizeLabel(rawLabel);
    let label = normalizedRawLabel.replace(/^\d+\s*/, "");
    const sectionLabel = [...headings].find((heading) => label === heading || (/^\d/.test(normalizedRawLabel) && normalizedRawLabel.endsWith(` ${heading}`)));
    if (sectionLabel) label = sectionLabel;
    if (headings.has(label)) { flushUnknown(); educationSection = label === "education details"; currentKey = sectionAliases[label] ?? (educationSection ? "qualification" : null); whatsappSection = label.includes("whatsapp"); genericContactBlock = label.includes("whatsapp"); requirementsSection = currentKey === "partner_requirements"; if (currentKey && value) append(currentKey, value); continue; }
    if (whatsappSection && ["father", "mother", "parents", "profile"].includes(label)) {
      const key = label === "father" ? "father_whatsapp" : label === "mother" ? "mother_whatsapp" : label === "profile" ? "whatsapp_number" : "parents_whatsapp";
      const numbers = extractPhoneNumbers(value);
      if (numbers.length) numbers.forEach((number) => assignPhone(number, key));
      if (value) detected.add(key === "father_whatsapp" ? "Father's WhatsApp" : key === "mother_whatsapp" ? "Mother's WhatsApp" : key === "whatsapp_number" ? "WhatsApp number" : "Parents WhatsApp");
      currentKey = null; continue;
    }
    const partnerPrefixed = /^(?:partner(?:'s)?|preferred|required)\s+/i.test(rawLabel);
    const def = partnerPrefixed ? undefined : definitions.get(label);
    if (label === "father" && value) {
      if (/\b(?:own\s+business|business|shop|farmer|farming|job|occupation|employee|retired|doctor|teacher|engineer|driver|worker|service|late)\b/i.test(value)) {
        append("father_occupation", value);
        detected.add("Father occupation");
      } else {
        append("father_details", `Father: ${value}`);
        warnings.push(`“Father: ${value}” was kept as father details because its role is unclear.`);
      }
      currentKey = null;
      continue;
    }
    if (currentKey === "other_details" && /^age$/i.test(label) && value) {
      const candidateAge = /^(\d{1,3})(?:\s*(?:years?|yrs?))?$/i.exec(value.trim());
      if (candidateAge && Number(candidateAge[1]) <= 120) explicitAge = candidateAge[1];
      continue;
    }
    if (dobLabels.has(label) || (/^(?:candidate(?:'s)?\s+)?age(?:\s+of\s+candidate)?$/.test(label) && requirementsSection)) {
      if (requirementsSection) {
        append("partner_requirements", `${rawLabel}: ${value}`);
        currentKey = "partner_requirements";
      } else if (value) {
        const result = ageFromDate(value, referenceDate);
        if (result.valid) {
          dob = value.trim();
        }
        if (result.age !== null) derivedAge = result.age;
        if (result.age !== null) detected.add("Age");
        if (result.ambiguous) warnings.push(`DOB “${value}” is ambiguous; use YYYY-MM-DD or a date with an unambiguous day/month.`);
        else if (!result.valid) warnings.push(`DOB “${value}” is invalid or in the future and was not used.`);
        else if (result.age === null && /^\d{4}$/.test(value.trim())) warnings.push(`DOB “${value}” has year-only precision, so an age was not calculated.`);
        else if (result.age === null) warnings.push(`DOB “${value}” is missing the day and falls in the current birth month, so an exact age was not calculated.`);
      }
      continue;
    }
    if (requirementsSection && def && !["partner_requirements", "father_whatsapp", "mother_whatsapp", "whatsapp_number", "parents_whatsapp"].includes(def.key)) {
      append("partner_requirements", `${rawLabel}: ${value || ""}`);
      continue;
    }
    if (label === "siblings" || label === "sibling") {
      const counts = parseCombinedSiblingCounts(value, data.gender);
      if (counts.sisters !== undefined) data.sisters_count = counts.sisters;
      if (counts.brothers !== undefined) data.brothers_count = counts.brothers;
      currentKey = null;
      continue;
    }
    if (def) {
      flushUnknown(); currentKey = def.key;
      whatsappSection = false;
      if (def.key === "parents_whatsapp") genericContactBlock = true;
      if (["father_whatsapp", "mother_whatsapp", "whatsapp_number"].includes(def.key)) {
        const phones = extractPhoneNumbers(value);
        if (phones.length) phones.forEach((number, index) => assignPhone(number, index === 0 ? def.key : undefined));
        continue;
      }
      if (!value) continue;
      if (def.key === "partner_requirements") append(def.key, `${rawLabel}: ${value}`);
      else if (def.key === "age") {
        const candidateAge = /^(\d{1,3})(?:\s*(?:years?|yrs?))?$/i.exec(value.trim());
        if (candidateAge && Number(candidateAge[1]) <= 120) explicitAge = candidateAge[1];
        else continue;
      } else if (def.key === "other_details") {
        const labeledAge = /(?:^|\n)\s*age\s*[:=]\s*(\d{1,3})(?:\s*(?:years?|yrs?))?\s*$/i.exec(value);
        if (labeledAge && Number(labeledAge[1]) <= 120) explicitAge = labeledAge[1];
        append(def.key, `${rawLabel}: ${value}`);
      } else if (def.key === "gender") data.gender = ({ female: "female", woman: "female", male: "male", man: "male" } as Record<string, string>)[normalizeLabel(value)] ?? value;
      else if (def.key === "marital_status") data.marital_status = ({ unmarried: "unmarried", single: "unmarried", married: "married", divorced: "divorced", divorce: "divorced", widow: "widowed", widower: "widowed", widowed: "widowed" } as Record<string, string>)[normalizeLabel(value)] ?? value;
      else if (def.key === "sisters_count" || def.key === "brothers_count") {
        const sibling = parseSiblingCount(value); data[def.key] = sibling.count;
        if (sibling.details) append(def.key === "sisters_count" ? "sisters_details" : "brothers_details", sibling.details);
      } else if (def.key === "married_sisters_count" || def.key === "married_brothers_count") data[def.key] = /^\d+/.exec(value)?.[0] ?? value;
      else if (["father_details", "mother_details", "other_details", "brothers_details", "sisters_details"].includes(def.key)) append(def.key, `${rawLabel}: ${value}`);
      else append(def.key, value);
      detected.add(def.label); continue;
    }
    if (educationSection && value === "" && !hasSeparator) {
      append("qualification", line);
      detected.add("Qualification");
      currentKey = "qualification";
      continue;
    }
    // Explicit partner-specific attributes stay in the partner narrative and never overwrite candidate fields.
    if (partnerPrefixed) {
      const partnerLabel = /^preferred\s+/i.test(rawLabel) ? rawLabel : rawLabel.replace(/^(?:partner(?:'s)?|required)\s+/i, "");
      append("partner_requirements", `${partnerLabel}: ${value || ""}`); currentKey = "partner_requirements"; continue;
    }
    if (currentKey === "partner_requirements" || currentKey === "other_details") append(currentKey, line);
    else if (hasSeparator) { flushUnknown(); unknown = rawLine.trimEnd(); currentKey = null; }
    else if (currentKey) append(currentKey, line);
    else unknown = unknown ? `${unknown}\n${rawLine.trimEnd()}` : rawLine.trimEnd();
  }
  flushUnknown();
  if (explicitAge !== undefined) data.age = explicitAge;
  else if (derivedAge !== undefined) data.age = derivedAge;
  return { data, detected: [...detected], unrecognized, warnings, ...(dob ? { dob } : {}), ...(explicitAge !== undefined ? { ageExplicit: true } : {}) };
}
