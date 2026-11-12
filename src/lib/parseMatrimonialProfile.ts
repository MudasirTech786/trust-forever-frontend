export type ProfileFormKey =
  | "name" | "gender" | "marital_status" | "age" | "height" | "sect" | "caste"
  | "language" | "qualification" | "educational_institution" | "employed" | "job" | "business" | "income"
  | "father_details" | "mother_details" | "house_size" | "society" | "city" | "sisters_count" | "sisters_details"
  | "father_name" | "father_occupation" | "other_details"
  | "married_sisters_count" | "brothers_count" | "brothers_details" | "married_brothers_count"
  | "partner_requirements" | "father_whatsapp" | "mother_whatsapp" | "whatsapp_number" | "parents_whatsapp";

export type MatrimonialProfileParseResult = {
  data: Partial<Record<ProfileFormKey, string | number>>;
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

add("name", "Name", ["name", "candidate name", "full name", "boy name", "girl name", "name of candidate", "nme"]);
add("gender", "Gender", ["gender", "gendr", "sex"]);
add("marital_status", "Marital status", ["marital status", "marriage status", "m status", "martial status", "marital", "martial", "single married widow divorced", "single/married/widow/divorced"]);
add("age", "Age", ["age", "current age", "candidate age", "candidate's age", "profile age", "age of candidate", "bride age", "groom age", "boy age", "girl age"]);
add("height", "Height", ["height", "hight", "ht", "tall", "candidate height", "boy height", "girl height", "height ft", "height feet"]);
add("sect", "Sect", ["sect", "sects", "religion sect", "maslak", "firqah", "sect maslak", "maslak/sect", "school of thought", "religious sect"]);
add("caste", "Caste", ["cast", "caste", "biradari", "baradari", "tribe", "family caste", "community"]);
add("language", "Language", ["language", "languages", "mother tongue", "mother language", "native language", "spoken language", "mother lang", "lang"]);
add("qualification", "Qualification", ["qualification", "qualifications", "qual", "education", "educational qualification", "academic qualification", "degree", "highest education", "study", "educational background", "education details"]);
add("educational_institution", "Educational institution", ["institution", "institute", "university", "college", "school", "educational institution", "educational institute", "studied at", "graduated from", "university name", "education institute", "name of educational institution", "college university", "religious education"]);
add("employed", "Employment", ["employed", "employed?", "currently working", "job status", "employment", "employment status", "occupation status", "doing job", "doing business", "self employed", "unemployed", "not working", "student"]);
add("job", "Job", ["job", "profession", "occupation", "working as", "designation", "position", "department", "company", "employer", "job details", "work", "career", "candidate occupation", "candidate's occupation", "job business", "job bussines", "business job"]);
add("business", "Business", ["business", "own business", "self business", "business details", "running business", "business type", "entrepreneur", "business occupation", "candidate business", "job/business", "job / business"]);
add("income", "Income", ["income", "monthly income", "salary", "monthly salary", "earning", "earnings", "annual income", "yearly income", "monthly earnings", "income per month", "source of income", "income if the profile is male", "income if profile is male"]);
add("father_name", "Father name", ["father name", "father's name"]);
add("father_occupation", "Father occupation", ["father occupation", "father's occupation", "father job", "father job/business", "father job business", "father profession"]);
add("father_details", "Father details", ["father", "father details", "father name and profession", "father's name and profession", "father's name profession"]);
add("mother_details", "Mother", ["mother", "mother's name", "mother name", "mother occupation", "mother's occupation", "mother job", "mother job/business", "mother profession", "mother name and profession", "mother's name profession"]);
add("house_size", "House size", ["house size", "size of house", "size"]);
add("society", "Society", ["society", "area", "area of residence and city", "area of residence & city", "residence", "address", "current address", "location"]);
add("city", "City", ["city", "city you lived", "current city", "home city"]);
add("sisters_count", "Sisters", ["sisters", "sister", "total sisters", "no of sisters", "number of sisters", "s", "sisters count", "sibling sisters"]);
add("sisters_details", "Sisters details", ["sisters details", "sibling details"]);
add("married_sisters_count", "Married sisters", ["married sisters", "married sister", "sisters married", "married s", "married sis"]);
add("brothers_count", "Brothers", ["brothers", "brother", "total brothers", "no of brothers", "number of brothers", "b", "brothers count", "sibling brothers"]);
add("brothers_details", "Brothers details", ["brothers details", "siblings details", "siblings", "siblings detail"]);
add("married_brothers_count", "Married brothers", ["married brothers", "married brother", "brothers married", "married b", "married bro"]);
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
for (const alias of ["d o b", "d o b"]) dobLabels.add(normalizeLabel(alias));

type ParsedDate = { date: string | null; ambiguous: boolean; invalid: boolean };
function parseDate(value: string): ParsedDate {
  const trimmed = value.trim().replace(/^as\s+per\s+id\s+card\s*[:, -]*/i, "");
  let match = /^(\d{4})[\s./-]+(\d{1,2})[\s./-]+(\d{1,2})$/.exec(trimmed);
  let year: number, month: number, day: number;
  if (match) { year = +match[1]; month = +match[2]; day = +match[3]; }
  else {
    match = /^(\d{1,2})[\s./-]+(\d{1,2})[\s./-]+(\d{4})$/.exec(trimmed);
    if (match) {
      const first = +match[1], second = +match[2];
      year = +match[3];
      if (first > 12 && second <= 12) { day = first; month = second; }
      else if (second > 12 && first <= 12) { month = first; day = second; }
      else if (first <= 12 && second <= 12) { day = first; month = second; }
      else return { date: null, ambiguous: false, invalid: true };
    }
    else {
      const monthPattern = "(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)";
      const ordinal = "(\\d{1,2})(?:st|nd|rd|th)?";
      const named = new RegExp(`^(?:${ordinal}\\s*[-/. ,]?\\s*${monthPattern}\\s*[-/. ,]?\\s*(\\d{4})|${monthPattern}\\s+${ordinal},?\\s*(\\d{4}))$`, "i").exec(trimmed);
      if (!named) return { date: null, ambiguous: false, invalid: false };
      const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
      const monthIndex = (token: string) => months.findIndex((m) => m === token.toLowerCase() || (token.length >= 3 && m.startsWith(token.toLowerCase())));
      if (named[1]) { day = Number(named[1]); month = monthIndex(named[2]) + 1; year = Number(named[3]); }
      else { month = monthIndex(named[4]) + 1; day = Number(named[5]); year = Number(named[6]); }
    }
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  const valid = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return { date: valid ? `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null, ambiguous: false, invalid: !valid };
}
type DobAgeResult = { age: string | null; ambiguous: boolean; valid: boolean; error?: "format" | "impossible" | "future" };
function ageFromDate(value: string, today = new Date()): DobAgeResult {
  const parsed = parseDate(value);
  let year: number, month: number, day: number | undefined;
  if (parsed.date) [year, month, day] = parsed.date.split("-").map(Number);
  else {
    if (parsed.ambiguous) return { age: null, ambiguous: false, valid: false };
    if (parsed.invalid) return { age: null, ambiguous: false, valid: false, error: "impossible" };
    const trimmed = value.trim();
    const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    let partial: RegExpExecArray | null;
    let namedMonth = "";
    if ((partial = /^(\d{1,2})\s*[-/. ]\s*(\d{4})$/.exec(trimmed))) {
      month = +partial[1]; year = +partial[2];
    } else if ((partial = /^(\d{4})\s*[-/. ]\s*(\d{1,2})$/.exec(trimmed))) {
      year = +partial[1]; month = +partial[2];
    } else if ((partial = /^([a-z]+)\s+(\d{4})$/i.exec(trimmed))) {
      namedMonth = partial[1].toLowerCase(); year = +partial[2];
      month = monthNames.findIndex((name) => name === namedMonth || (namedMonth.length >= 3 && name.startsWith(namedMonth))) + 1;
    } else if ((partial = /^(\d{4})$/.exec(trimmed))) {
      year = +partial[1]; month = 0;
    } else return { age: null, ambiguous: false, valid: false, error: "format" };
    if (year < 1 || (month !== 0 && (month < 1 || month > 12))) return { age: null, ambiguous: false, valid: false, error: "impossible" };
    if (year > today.getFullYear()) return { age: null, ambiguous: false, valid: false, error: "future" };
    if (month === 0) return { age: null, ambiguous: false, valid: true };
    const partialAge = today.getFullYear() - year - (today.getMonth() + 1 < month ? 1 : 0);
    return { age: partialAge >= 0 ? String(partialAge) : null, ambiguous: false, valid: partialAge >= 0 };
  }
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  let age = currentYear - year;
  if (currentMonth < month || (currentMonth === month && currentDay < (day ?? 1))) age -= 1;
  const valid = age >= 0 && year <= currentYear;
  return { age: valid ? String(age) : null, ambiguous: false, valid, ...(!valid ? { error: "future" as const } : {}) };
}

function parseSiblingCount(value: string): { count: string; details?: string } {
  if (/^\s*-\s*\d/.test(value) || /^\s*\d+\s*\.\s*\d/.test(value)) return { count: value.trim() };
  if (/^\s*-\s*\d/.test(value) || /^\s*\d+\s*\.\s*\d/.test(value)) return { count: value.trim() };
  const match = /^\s*(\d+)\s*(?:\((.*)\))?\s*$/.exec(value);
  if (match && Number(match[1]) <= 255) return { count: String(Number(match[1])), ...(match[2] ? { details: match[2].trim() } : {}) };
  return { count: value.trim() };
}
function parseCombinedSiblingCounts(value: string, gender?: string): { sisters?: string; brothers?: string } {
  const expanded = value.replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/gi, (word) => String(({ one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 } as Record<string, number>)[word.toLowerCase()]));
  const match = /(?:(\d+)\s*(?:sisters?|sis\b))?\s*[,/&+and]*\s*(?:(\d+)\s*(?:brothers?|bros?\b))?/i.exec(expanded);
  if (!match || (!match[1] && !match[2])) return {};
  let sisters = match[1] ? Number(match[1]) : undefined;
  let brothers = match[2] ? Number(match[2]) : undefined;
  if (/including\s+me/i.test(value)) {
    if (gender === "female" && sisters !== undefined) sisters = Math.max(0, sisters - 1);
    if (gender === "male" && brothers !== undefined) brothers = Math.max(0, brothers - 1);
  }
  return { ...(sisters === undefined ? {} : { sisters: String(sisters) }), ...(brothers === undefined ? {} : { brothers: String(brothers) }) };
}
function extractSiblingNarrative(lines: string[]): { brothers?: number; sisters?: number; marriedBrothers?: number; marriedSisters?: number; brotherDetails: string[]; sisterDetails: string[] } {
  const numberWords: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
  const numeric = (value: string) => Number(/^\d+$/.test(value) ? value : numberWords[value.toLowerCase()]);
  let active: "brothers" | "sisters" | null = null;
  let brothers = 0, sisters = 0, sawBrothers = false, sawSisters = false;
  let marriedBrothers = 0, marriedSisters = 0, sawMarriedBrothers = false, sawMarriedSisters = false;
  let combinedDeclaration = false;
  const brotherDetails: string[] = [], sisterDetails: string[] = [];
  for (const source of lines) {
    const line = prepareLine(source).replace(/\\+$/, "").trim();
    if (!line) continue;
    const lower = normalizeLabel(line);
    const category = /\b(?:brothers?|bros?|bro)\b/i.test(line) ? "brothers" : /\b(?:sisters?|sis)\b/i.test(line) ? "sisters" : null;
    if (category) active = category;
    const number = "(\\d+|one|two|three|four|five|six|seven|eight|nine|ten)";
    const explicit = new RegExp(`\\b${number}\\s+(?:elder\\s+|younger\\s+|older\\s+)?(?:brothers?|bros?|bro|sisters?|sis)\\b`, "gi");
    const matches = [...line.matchAll(explicit)];
    if (/\b(?:brothers?|bros?|bro)\b/i.test(line) && /\b(?:sisters?|sis)\b/i.test(line) && matches.length) combinedDeclaration = true;
    if (matches.length) {
      // One category's total is its explicit declared count per phrase. Multiple
      // separately introduced sibling descriptions across lines are additive.
      for (const match of matches) {
        const kind = /sisters?|sis/i.test(match[0]) ? "sisters" : "brothers";
        const count = numeric(match[1]);
        if (!Number.isInteger(count) || count < 0 || count > 255) continue;
        if (kind === "brothers") { if (!(combinedDeclaration && count === 1 && brothers > 0)) brothers += count; sawBrothers = true; }
        else { if (!(combinedDeclaration && count === 1 && sisters > 0)) sisters += count; sawSisters = true; }
      }
      for (const match of matches) {
        const kind = /sisters?|sis/i.test(match[0]) ? "sisters" : "brothers";
        const tail = line.slice(match.index! + match[0].length);
        const married = /^(?:\s*(?:is|are)?\s*married\b|\s*[,;]\s*all\s+married\b)/i.test(tail) || /\ball\s+married\b/i.test(line) ||
          /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+married\b/i.exec(tail);
        const marriedCount = typeof married === "object" && married ? numeric(married[1]) : married ? numeric(match[1]) : 0;
        if (marriedCount > 0 && marriedCount <= numeric(match[1])) {
          if (kind === "brothers") { marriedBrothers = Math.max(marriedBrothers, marriedCount); sawMarriedBrothers = true; }
          else { marriedSisters = Math.max(marriedSisters, marriedCount); sawMarriedSisters = true; }
        }
      }
    }
    // Count repeated numbered continuation entries only when a sibling category
    // has already been established; occupations and locations alone add none.
    if (active && matches.length && !/\banother\b/i.test(line)) {
      const first = matches[matches.length - 1].index! + matches[matches.length - 1][0].length;
      const remainder = line.slice(first);
      const continuations = [...remainder.matchAll(new RegExp(`[,;]\\s*${number}\\s+(?=(?:in|living|working|doctor|teacher|manager|engineer|businessman|student)\\b)`, "gi"))];
      for (const match of continuations) {
        const count = numeric(match[1]);
        if (!Number.isInteger(count) || count < 0 || count > 255) continue;
        if (active === "brothers") { brothers += count; sawBrothers = true; }
        else { sisters += count; sawSisters = true; }
      }
    } else if (active) {
      const continuation = new RegExp(`^\\s*${number}\\s+(?=(?:in|living|working|doctor|teacher|manager|engineer|businessman|student)\\b)`, "i").exec(line);
      if (continuation) {
        const count = numeric(continuation[1]);
        if (Number.isInteger(count) && count > 0 && count <= 255) {
          if (active === "brothers") { brothers += count; sawBrothers = true; }
          else { sisters += count; sawSisters = true; }
        }
      }
    }
    if (category === "brothers" || (!category && active === "brothers")) brotherDetails.push(line);
    if (category === "sisters" || (!category && active === "sisters")) sisterDetails.push(line);
    const isContinuation = new RegExp(`^\\s*${number}\\s+(?=(?:in|living|working|doctor|teacher|manager|engineer|businessman|student)\\b)`, "i").test(line);
    if (!category && !isContinuation && !/^\s*(?:we are\s+\w+\s+siblings|family|siblings?(?:\s+details?)?)\s*[:.-]?\s*$/i.test(line) && !/^\s*\d+\s+sibling/i.test(line)) {
      if (!/^(?:both|all|one|two|three|four|five)\s+(?:are\s+)?(?:working|married|unmarried)/i.test(line)) active = null;
    }
  }
  return { ...(sawBrothers ? { brothers } : {}), ...(sawSisters ? { sisters } : {}), ...(sawMarriedBrothers ? { marriedBrothers } : {}), ...(sawMarriedSisters ? { marriedSisters } : {}), brotherDetails, sisterDetails };
}
function isReferenceLine(line: string): boolean { return /^(?:(?:profile\s*)?(?:no\.?|number|id|ref(?:erence)?(?:\s*(?:no\.?|number))?)|imb)\s*[:#-]?\s*[a-z0-9-]+$/i.test(line.trim()); }
function removeReferenceIds(value: string): string {
  return value
    .split("\n")
    .map((line) => line.replace(/\b(?:IMB\s*[:#-]?\s*[A-Z0-9-]+|Profile\s*(?:ID|No\.?|Number)\s*[:#-]?\s*IMB[A-Z0-9-]*)\b/gi, "").trim())
    .filter(Boolean)
    .join("\n");
}
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
  const separator = /[:：=]|(?:->|→)/.exec(cleaned);
  if (separator) return { rawLabel: cleaned.slice(0, separator.index).trim(), value: cleaned.slice(separator.index + separator[0].length).trim() };

  const markers = [...line.matchAll(/\*+([^*]+)\*+/g)];
  if (markers.length && /^\s*\*/.test(line)) {
    const rawLabel = markers.map((match) => match[1].trim()).join(" ");
    const last = markers[markers.length - 1];
    return { rawLabel, value: line.slice(last.index! + last[0].length).trim() };
  }

  const normalized = normalizeLabel(cleaned);
  const aliasValue = /^\s*(sisters?|brothers?|married\s+sisters?|married\s+brothers?)\s*[:：=]\s*(-\s*\d+|\d+\s*\.\s*\d+)\s*$/i.exec(cleaned);
  if (aliasValue) return { rawLabel: aliasValue[1], value: aliasValue[2] };
  const explicitBoundary = /[:：=]|(?:->|→)/.exec(cleaned);
  if (explicitBoundary) {
    const rawLabel = cleaned.slice(0, explicitBoundary.index).replace(/[>\-]+$/, "").trim();
    const alias = normalizeLabel(rawLabel);
    if (definitions.has(alias) || dobLabels.has(alias)) {
      return { rawLabel, value: cleaned.slice(explicitBoundary.index + explicitBoundary[0].length).trim() };
    }
  }
  // A single line may contain several compact label/value pairs (WhatsApp and
  // spreadsheet style pastes commonly have no line breaks between fields).
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
  // Explicit one-word values are accepted as labels only when followed by a
  // separator, preventing prose such as "male, 28, Rajpoot" from matching.
  const valueLabels: Record<string, ProfileFormKey> = { male: "gender", female: "gender", m: "gender", f: "gender", boy: "gender", girl: "gender", groom: "gender", bride: "gender", single: "marital_status", "never married": "marital_status", unmarried: "marital_status", divorced: "marital_status", widow: "marital_status", widower: "marital_status", working: "employed" };
  const valueLabel = Object.keys(valueLabels).sort((a, b) => b.length - a.length).find((alias) => {
    const re = new RegExp(`^${alias}\\s*[:：=\\-]\\s*(.+)$`, "i");
    return re.test(cleaned);
  });
  if (valueLabel) {
    const re = new RegExp(`^${valueLabel}\\s*[:：=\\-]\\s*(.+)$`, "i");
    return { rawLabel: valueLabel, value: cleaned.replace(re, "$1").trim() };
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
  const data: Partial<Record<ProfileFormKey, string | number>> = {};
  const detected = new Set<string>(), unrecognized: string[] = [], warnings: string[] = [];
  const normalizedText = text
    .replace(/\\(?=\r?\n)/g, "")
    .replace(/\\r\\n|\\n|\\r/g, "\n")
    .replace(/\\(?=\s*-{3,}(?:\\|$))/g, "\n")
    .replace(/\\(?=\s*(?:(?:\\?\*?\s*)?\d{1,2}\s*:|PERSONAL\s+INFORMATION\b|ADDRESS\b|REQUIREMENTS\b))/gi, "\n")
    .replace(/\r\n?/g, "\n");
  const lines = normalizedText.split("\n").filter((line) => !/\bIMB\s*[:#-]?\s*[A-Z0-9-]+\b/i.test(line.trim()));
  let currentKey: ProfileFormKey | null = null, unknown = "";
  let whatsappSection = false, requirementsSection = false, genericContactBlock = false, educationSection = false;
  let explicitAge: string | undefined, derivedAge: string | undefined, dob: string | undefined;
  const flushUnknown = (): void => { if (unknown.trim()) unrecognized.push(unknown.trim()); unknown = ""; };
  const append = (key: ProfileFormKey, value: string): void => {
    const cleaned = removeReferenceIds(value).trim();
    if (!cleaned) return;
    const existing = data[key] === undefined ? [] : String(data[key]).split("\n").map((part) => part.trim());
    if (existing.includes(cleaned)) return;
    data[key] = data[key] ? `${data[key]}\n${cleaned}` : cleaned;
  };
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
    const value = parsedField.value.replace(/^\s*[-–—>]+\s*/, "").replace(/^(["'`*_]+)([\s\S]*?)\1$/, "$2").trim();
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
        else if (result.error === "impossible") warnings.push(`DOB “${value}” is an impossible calendar date and was not used.`);
        else if (result.error === "future") warnings.push(`DOB “${value}” is in the future and was not used.`);
        else if (result.error === "format") warnings.push(`DOB “${value}” has an unsupported or invalid format and was not used.`);
        else if (!result.valid) warnings.push(`DOB “${value}” has an unsupported or invalid format and was not used.`);
        else if (result.age === null && /^\d{4}$/.test(value.trim())) warnings.push(`DOB “${value}” has year-only precision, so an age was not calculated.`);
      }
      continue;
    }
    if (def?.key === "gender" && ["male", "female", "m", "f", "boy", "girl", "groom", "bride"].includes(label) && value) {
      data.gender = ["female", "f", "girl", "bride"].includes(label) ? "female" : "male";
      detected.add("Gender");
      currentKey = null;
      continue;
    }
    if (def?.key === "marital_status" && ["single", "never married", "unmarried", "divorced", "widow", "widower", "marriage"].includes(label) && value) {
      data.marital_status = ({ "never married": "unmarried", unmarried: "unmarried", single: "unmarried", divorced: "divorced", widow: "widowed", widower: "widowed" } as Record<string, string>)[label] ?? value;
      detected.add("Marital status");
      currentKey = null;
      continue;
    }
    if (requirementsSection && def && !["partner_requirements", "father_whatsapp", "mother_whatsapp", "whatsapp_number", "parents_whatsapp"].includes(def.key)) {
      append("partner_requirements", `${rawLabel}: ${value || ""}`);
      continue;
    }
    if (label === "siblings" || label === "sibling") {
      const counts = parseCombinedSiblingCounts(value, data.gender === undefined ? undefined : String(data.gender));
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
      else if (def.key === "marital_status") data.marital_status = ({ unmarried: "unmarried", "never married": "unmarried", single: "unmarried", married: "married", divorced: "divorced", divorce: "divorced", widow: "widowed", widower: "widowed", widowed: "widowed" } as Record<string, string>)[normalizeLabel(value)] ?? value;
      else if (def.key === "sisters_count" || def.key === "brothers_count") {
        const sibling = parseSiblingCount(value);
        if (/^-\s*\d/.test(value) || /^\s*\d+\s*\.\s*\d/.test(value)) { warnings.push(`“${rawLabel}: ${value}” is not a valid non-negative integer sibling count.`); data[def.key] = ""; }
        else if (/^\d+$/.test(sibling.count) && Number(sibling.count) <= 255) data[def.key] = String(Number(sibling.count));
        else { warnings.push(`“${rawLabel}: ${value}” did not contain a clear sibling count and was left for review.`); append(def.key === "sisters_count" ? "sisters_details" : "brothers_details", value); }
        if (sibling.details) append(def.key === "sisters_count" ? "sisters_details" : "brothers_details", sibling.details);
      } else if (def.key === "married_sisters_count" || def.key === "married_brothers_count") {
        const answer = normalizeLabel(value).replace(/[.!]+$/, "");
        const booleanCount = /^(?:yes|y)$/.test(answer) ? 1 : /^(?:no|n)$/.test(answer) ? 0 : undefined;
        const count = /^\s*(?!-)(\d+)(?!\s*\.\s*\d)\b/.exec(value)?.[1];
        if (booleanCount !== undefined) data[def.key] = booleanCount;
        else if (count !== undefined && Number(count) <= 255) data[def.key] = Number(count);
        else { warnings.push(`“${rawLabel}: ${value}” did not contain a clear married sibling count and was left for review.`); append("other_details", `${rawLabel}: ${value}`); }
      }
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
    else if (currentKey === "sisters_count" || currentKey === "brothers_count" || currentKey === "married_sisters_count" || currentKey === "married_brothers_count") {
      const countMatch = /^\s*(\d+)\s*$/.exec(line);
      if (countMatch && Number(countMatch[1]) <= 255) data[currentKey] = String(Number(countMatch[1]));
      else if (/^\s*-?\d+(?:\.\d+)?\s*$/.test(line)) warnings.push(`Sibling count “${line.trim()}” is not a non-negative integer from 0 to 255 and was left empty.`);
      else append(currentKey === "sisters_count" || currentKey === "married_sisters_count" ? "sisters_details" : "brothers_details", line);
    }
    else if (currentKey) append(currentKey, line);
    else unknown = unknown ? `${unknown}\n${rawLine.trimEnd()}` : rawLine.trimEnd();
  }
  flushUnknown();
  const siblingNarrative = extractSiblingNarrative(lines);
  for (const line of lines) {
    const invalidCount = /^\s*(married\s+)?(sisters?|sis|brothers?|bros?|bro)(?:\s+count)?\s*[:=\-]\s*(-\s*\d+|\d+\s*\.\s*\d+)\s*$/i.exec(prepareLine(line));
    if (invalidCount) {
      const key: ProfileFormKey = /sister|sis/i.test(invalidCount[2]) ? (invalidCount[1] ? "married_sisters_count" : "sisters_count") : (invalidCount[1] ? "married_brothers_count" : "brothers_count");
      delete data[key];
      warnings.push(`Sibling count “${invalidCount[3]}” is not a non-negative integer and was left empty.`);
    }
  }
  if (data.brothers_count === undefined && siblingNarrative.brothers !== undefined) data.brothers_count = String(siblingNarrative.brothers);
  if (data.sisters_count === undefined && siblingNarrative.sisters !== undefined) data.sisters_count = String(siblingNarrative.sisters);
  if (data.married_brothers_count === undefined && siblingNarrative.marriedBrothers !== undefined) data.married_brothers_count = siblingNarrative.marriedBrothers;
  if (data.married_sisters_count === undefined && siblingNarrative.marriedSisters !== undefined) data.married_sisters_count = siblingNarrative.marriedSisters;
  for (const [key, details] of [["brothers_details", siblingNarrative.brotherDetails], ["sisters_details", siblingNarrative.sisterDetails]] as const) {
    const existing = data[key] ? String(data[key]) : "";
    const additions = details.filter((detail) => !existing.toLowerCase().includes(detail.toLowerCase()));
    if (additions.length) append(key, additions.join("\n"));
  }
  if (explicitAge !== undefined) data.age = explicitAge;
  else if (derivedAge !== undefined) data.age = derivedAge;
  for (const key of ["sisters_count", "married_sisters_count", "brothers_count", "married_brothers_count"] as const) {
    const count = data[key];
    if (count !== undefined && count !== "" && (!/^\d+$/.test(String(count)) || Number(count) > 255)) {
      delete data[key];
      warnings.push(`Sibling count “${count}” is not a non-negative integer from 0 to 255 and was left empty.`);
    }
  }
  return { data, detected: [...detected], unrecognized, warnings, ...(dob ? { dob } : {}), ...(explicitAge !== undefined ? { ageExplicit: true } : {}) };
}
