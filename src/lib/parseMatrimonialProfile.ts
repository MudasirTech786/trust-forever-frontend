export type ProfileFormKey =
  | "name" | "gender" | "marital_status" | "date_of_birth" | "height" | "sect" | "caste"
  | "language" | "qualification" | "educational_institution" | "employed" | "job" | "business" | "income"
  | "father_details" | "mother_details" | "house_size" | "society" | "city" | "sisters_count" | "sisters_details"
  | "father_name" | "father_occupation" | "other_details"
  | "married_sisters_count" | "brothers_count" | "brothers_details" | "married_brothers_count"
  | "partner_requirements" | "father_whatsapp" | "mother_whatsapp" | "whatsapp_number" | "parents_whatsapp";

export type MatrimonialProfileParseResult = {
  data: Partial<Record<ProfileFormKey, string>>;
  detected: string[];
  warnings: string[];
  missingRequired: string[];
  unrecognized: string[];
};

type FieldDefinition = { key: ProfileFormKey; label: string };

const definitions = new Map<string, FieldDefinition>();
const addAliases = (key: ProfileFormKey, label: string, aliases: string[]): void => {
  for (const alias of aliases) definitions.set(normalizeLabel(alias), { key, label });
};

function normalizeLabel(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2019\u2018\u0060]/g, "'")
    .replace(/[’‘`]/g, "'")
    .replace(/[^\p{L}\p{N}']+/gu, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

addAliases("gender", "Gender", ["gender"]);
addAliases("marital_status", "Marital status", ["marital status"]);
addAliases("name", "Name", ["name"]);
addAliases("date_of_birth", "Date of birth", ["dob", "date of birth"]);
addAliases("height", "Height", ["height"]);
addAliases("sect", "Sect", ["sect"]);
addAliases("caste", "Caste", ["caste"]);
addAliases("language", "Language", ["language"]);
addAliases("qualification", "Qualification", ["qualification", "qualifications"]);
addAliases("educational_institution", "Educational institution", ["educational institution", "name of educational institution"]);
addAliases("employed", "Employment", ["employed", "employment"]);
addAliases("job", "Job", ["job"]);
addAliases("business", "Business", ["business"]);
addAliases("income", "Income", ["income", "income if the profile is male", "income if profile is male"]);
addAliases("house_size", "House size", ["house size", "size of house"]);
addAliases("society", "Society", ["society"]);
addAliases("city", "City", ["city"]);
addAliases("father_details", "Father details", ["father"]);
addAliases("father_name", "Father name", ["father's name", "father' name", "father name"]);
addAliases("father_occupation", "Father occupation", ["father occupation"]);
addAliases("mother_details", "Mother", ["mother", "mother's name", "mother name", "mother occupation"]);
addAliases("other_details", "Other details", ["other details"]);
addAliases("whatsapp_number", "WhatsApp number", ["whatsapp number", "whatsapp nbr", "personal whatsapp number"]);
addAliases("parents_whatsapp", "Parents WhatsApp", ["parents whatsapp nbr", "parents whatsapp number", "parent whatsapp nbr", "parent whatsapp number"]);
addAliases("sisters_count", "Sisters", ["sisters", "sister"]);
addAliases("married_sisters_count", "Married sisters", ["married sisters", "married sis"]);
addAliases("brothers_count", "Brothers", ["brothers", "brother"]);
addAliases("married_brothers_count", "Married brothers", ["married brothers", "married bro"]);
addAliases("partner_requirements", "Partner requirements", ["life partner requirements", "life partner requirement", "partner requirements"]);
addAliases("father_whatsapp", "Father’s WhatsApp", ["father whatsapp", "father whatsapp number", "father whatsapp nbr", "father whatsapp nbrs"]);
addAliases("mother_whatsapp", "Mother’s WhatsApp", ["mother whatsapp", "mother whatsapp number", "mother whatsapp nbr", "mother whatsapp nbrs"]);

const headings = new Set([
  "personal information", "family details", "parents details", "life partner requirements",
  "life partner requirement", "partner requirements", "parents whatsapp numbers", "parent whatsapp numbers",
  "parents' whatsapp numbers", "parent's whatsapp numbers", "parents whatsapp nbrs", "parents' whatsapp nbrs",
  "parent whatsapp nbrs", "personal details", "family information",
]);
const requiredLabels = ["Name", "Gender", "Marital Status", "Date of Birth"];

function parseDate(value: string): string | null {
  const trimmed = value.trim().replace(/^as\s+per\s+id\s+card\s*[:, -]*/i, "");
  let year: number;
  let month: number;
  let day: number;
  let match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (match) {
    year = Number(match[1]);
    month = Number(match[2]);
    day = Number(match[3]);
  } else {
    match = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(trimmed);
    if (match) {
      day = Number(match[1]);
      month = Number(match[2]);
      year = Number(match[3]);
    } else {
      match = /^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/i.exec(trimmed);
      if (!match) return null;
      day = Number(match[1]);
      year = Number(match[3]);
      const monthIndex = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
        .findIndex((name) => name === match![2].toLowerCase() || (match![2].length >= 3 && name.startsWith(match![2].toLowerCase())));
      if (monthIndex < 0) return null;
      month = monthIndex + 1;
    }
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function normalizeChoice(value: string, choices: Record<string, string>): string {
  return choices[normalizeLabel(value)] ?? value.trim();
}

function appendCombinedValue(data: Partial<Record<ProfileFormKey, string>>, key: "father_details" | "mother_details", value: string, label: string): void {
  if (!value) return;
  const existing = data[key];
  data[key] = existing ? `${existing}\n${label}: ${value}` : value;
}

function parseSiblingCount(value: string): { count: string; details?: string } {
  const match = /^\s*(\d+)\s*(?:\((.*)\))?\s*$/.exec(value);
  if (match) return { count: match[1], ...(match[2] ? { details: match[2].trim() } : {}) };
  const withTrailingDetails = /^\s*(\d+)\s+(.+)$/.exec(value);
  if (withTrailingDetails) return { count: withTrailingDetails[1], details: withTrailingDetails[2].trim() };
  return { count: value.trim() };
}

export function parseMatrimonialProfileText(text: string): MatrimonialProfileParseResult {
  const data: Partial<Record<ProfileFormKey, string>> = {};
  const detected = new Set<string>();
  const warnings = new Set<string>();
  const unrecognized: string[] = [];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  let currentKey: ProfileFormKey | null = null;
  let unrecognizedBlock = "";
  let whatsappSection = false;

  const flushUnknown = (): void => {
    if (unrecognizedBlock.trim()) unrecognized.push(unrecognizedBlock.trim());
    unrecognizedBlock = "";
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (currentKey === "partner_requirements" && data.partner_requirements) data.partner_requirements += "\n\n";
      else if (unrecognizedBlock) unrecognizedBlock += "\n";
      continue;
    }

    const colonIndex = line.indexOf(":");
    const rawLabel = colonIndex >= 0 ? line.slice(0, colonIndex) : line;
    const value = colonIndex >= 0 ? line.slice(colonIndex + 1).trim() : "";
    const labelKey = normalizeLabel(rawLabel);

    if (headings.has(labelKey)) {
      flushUnknown();
      currentKey = null;
      whatsappSection = labelKey.includes("whatsapp");
      if (labelKey.includes("life partner") || labelKey === "partner requirements") {
        currentKey = "partner_requirements";
        if (value) data.partner_requirements = value;
      } else if (whatsappSection && value) {
        data.parents_whatsapp = value;
        detected.add("Parents WhatsApp");
      }
      continue;
    }

    const definition = definitions.get(labelKey);
    if (definition) {
      flushUnknown();
      currentKey = definition.key;
      if (whatsappSection && labelKey === "father") {
        data.father_whatsapp = value;
        detected.add("Father’s WhatsApp");
        continue;
      }
      if (whatsappSection && labelKey === "mother") {
        data.mother_whatsapp = value;
        detected.add("Mother’s WhatsApp");
        continue;
      }
      if (definition.key === "father_details" || definition.key === "mother_details") {
        appendCombinedValue(data, definition.key, value, rawLabel.trim());
      } else if (definition.key === "sisters_count" || definition.key === "brothers_count") {
        const parsed = parseSiblingCount(value);
        data[definition.key] = parsed.count;
        const detailsKey = definition.key === "sisters_count" ? "sisters_details" : "brothers_details";
        if (parsed.details) data[detailsKey] = parsed.details;
      } else if (definition.key === "date_of_birth") {
        const parsedDate = parseDate(value);
        data.date_of_birth = parsedDate ?? "";
        if (!parsedDate) {
          const warning = /^as\s+per\s+id\s+card/i.test(value)
            ? `DOB was read as “${value}”, but it does not contain a valid day and month. Enter the complete date from the ID card.`
            : "Date of birth needs review; enter a complete valid date in the form.";
          warnings.add(warning);
        }
      } else if (definition.key === "gender") {
        data.gender = normalizeChoice(value, { female: "female", woman: "female", male: "male", man: "male" });
      } else if (definition.key === "marital_status") {
        data.marital_status = normalizeChoice(value, { unmarried: "unmarried", single: "unmarried", married: "married", divorced: "divorced", widowed: "widowed" });
      } else if (definition.key === "employed") {
        const normalized = normalizeLabel(value);
        data.employed = ["yes", "y", "true", "employed"].includes(normalized) ? "1"
          : ["no", "n", "false", "not employed", "unemployed"].includes(normalized) ? "0" : value;
      } else if (definition.key === "married_sisters_count" || definition.key === "married_brothers_count") {
        data[definition.key] = /^\d+/.exec(value)?.[0] ?? value;
      } else {
        data[definition.key] = value;
      }
      if (value || definition.key === "date_of_birth") detected.add(definition.label);
      continue;
    }

    if (currentKey === "partner_requirements" || currentKey === "other_details") {
      data[currentKey] = `${data[currentKey] ?? ""}\n${line}`.trim();
      continue;
    }

    currentKey = null;
    const unknownLine = rawLine.trimEnd();
    unrecognizedBlock = unrecognizedBlock ? `${unrecognizedBlock}\n${unknownLine}` : unknownLine;
  }
  flushUnknown();

  const missingRequired = requiredLabels.filter((label) => {
    const key = label === "Name" ? "name" : label === "Gender" ? "gender" : label === "Marital Status" ? "marital_status" : "date_of_birth";
    return !data[key]?.trim();
  });

  return { data, detected: [...detected], warnings: [...warnings], missingRequired, unrecognized };
}
