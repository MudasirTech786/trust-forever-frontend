/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const parserPath = path.join(__dirname, "../src/lib/parseMatrimonialProfile.ts");
const compiled = ts.transpile(fs.readFileSync(parserPath, "utf8"), {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2020,
});
const parserModule = { exports: {} };
vm.runInNewContext(compiled, { exports: parserModule.exports, module: parserModule, require });
const parse = parserModule.exports.parseMatrimonialProfileText;

const mariaSaeedExact = [
  "\u0031\ufe0f\u20e3⭕ *name* Maria Saeed",
  "\u0032\ufe0f\u20e3⭕ *Age* 27",
  "\u0033\ufe0f\u20e3⭕ *Height* 5\"",
  "\u0034\ufe0f\u20e3⭕ *complexion* Fair",
  "\u0035\ufe0f\u20e3⭕ *Nationality* Pakistani",
  "\u0036\ufe0f\u20e3⭕ *city you lived* Lahore",
  "\u0037\ufe0f\u20e3⭕ *House/ Own",
  "\u0038\ufe0f\u20e3⭕ *Social Status* Middle class",
  "\u0039\ufe0f\u20e3⭕ *Qualification* ADP arts",
  "\u0031\ufe0f\u20e3\u0030\ufe0f\u20e3⭕ *Religious Education*",
  "Shahada ul Aalmiya (Wafaq ul Madariss)",
  "\u0031\ufe0f\u20e3\u0031\ufe0f\u20e3⭕ *Single /married/widow/divorced:* Single",
  "\u0031\ufe0f\u20e3\u0032\ufe0f\u20e3⭕ *Caste* Mughal",
  "\u0031\ufe0f\u20e3\u0033\ufe0f\u20e3⭕ *School of thought* Ahl e Hadees",
  "\u0031\ufe0f\u20e3\u0034\ufe0f\u20e3⭕ *Siblings* 2 Sister 3 Brothers (including me)",
  "\u0031\ufe0f\u20e3\u0035\ufe0f\u20e3⭕ *Father's* *occupation:* Not Alive",
  "\u0031\ufe0f\u20e3\u0036\ufe0f\u20e3⭕ *Candidate's* *occupation:* Teacher at Jamiya",
  "\u0031\ufe0f\u20e3\u0037\ufe0f\u20e3⭕ *Demands:* Well Manners, Educated, Must be Ahl e Hadees",
  "\u0031\ufe0f\u20e3\u0038\ufe0f\u20e3⭕ *Residence* Lahore",
  "\u0031\ufe0f\u20e3\u0039\ufe0f\u20e3☎ 0332 0707447 (Big Sister)",
  "03009476073 (Mother)",
  "I pay witness that above provided information is totally correct.",
].join("\n");
const mariaSaeedMojibake = mariaSaeedExact
  .replace(/(\d)\ufe0f\u20e3/g, "$1\u00ef\u00b8\u008f\u00e2\u0192\u00a3")
  .replace(/⭕/g, "\u00e2\u00ad\u2022")
  .replace(/☎/g, "\u00e2\u02dc\u017d");

function checkMariaSaeed(result) {
  assert.equal(result.data.name, "Maria Saeed");
  assert.equal(result.data.marital_status, "unmarried");
  assert.equal(result.data.height, '5"');
  assert.equal(result.data.qualification, "ADP arts");
  assert.equal(result.data.educational_institution, "Shahada ul Aalmiya (Wafaq ul Madariss)");
  assert.equal(result.data.father_occupation, "Not Alive");
  assert.equal(result.data.job, "Teacher at Jamiya");
  assert.equal(result.data.sect, "Ahl e Hadees");
  assert.equal(result.data.society, "Lahore");
  assert.equal(result.data.mother_whatsapp, "03009476073");
  assert.equal(result.data.age, "27");
  assert.match(result.data.other_details, /Complexion: Fair/i);
  assert.match(result.data.other_details, /Nationality: Pakistani/i);
  assert.match(result.data.other_details, /Social Status: Middle class/);
  assert.equal(result.data.sisters_count, "2");
  assert.equal(result.data.brothers_count, "3");
  assert.match(result.data.partner_requirements, /Well Manners, Educated/);
  assert.equal(result.data.whatsapp_number, "0332 0707447");
  assert.equal(result.data.mother_whatsapp, "03009476073");
  assert.equal(result.data.sisters_count, "2");
  assert.equal(result.data.brothers_count, "3");
  assert.equal(result.data.gender, undefined);
  assert.equal(result.data.age, "27");
  assert.equal("missingRequired" in result, false);
  const unrecognizedText = result.unrecognized.join("\n");
  for (const recognized of ["name", "Age", "Height", "complexion", "Nationality", "city you lived", "Social Status", "Qualification", "Religious Education", "Caste", "School of thought", "Siblings", "Father's", "Candidate's", "Demands", "Residence"]) {
    assert.ok(!unrecognizedText.toLowerCase().includes(recognized.toLowerCase()), `${recognized} should not be unrecognized`);
  }
  assert.doesNotMatch(unrecognizedText, /I pay witness/);
}

test("exact Maria Saeed format parses fields and contacts without misclassifying them", () => {
  const first = parse(mariaSaeedExact);
  checkMariaSaeed(first);
  assert.deepEqual(JSON.parse(JSON.stringify(first)), JSON.parse(JSON.stringify(parse(mariaSaeedExact))));
});

test("Maria Saeed format accepts escaped Markdown asterisks", () => {
  checkMariaSaeed(parse(mariaSaeedExact.replace(/\*/g, "\\*")));
});

test("Maria Saeed format accepts literal escaped newline sequences", () => {
  checkMariaSaeed(parse(mariaSaeedExact.replace(/\n/g, "\\n")));
});

test("Maria Saeed format accepts the copied mojibake emoji prefixes", () => {
  checkMariaSaeed(parse(mariaSaeedMojibake));
});

const numberedPersonalInformation = [
  "IMB 19008",
  "PERSONAL INFORMATION",
  "01: Gender: Male",
  "02: Name: xyz",
  "03: Father's Name: shaharyar jang",
  "04: DOB: 25. 6. 1995",
  "05: Cast: Rajpoot",
  "06: Religion: islam",
  "07: Sect: Sunni",
  "08: Marital Status: single",
  "09: Height: 5.7",
  "10: Disability: no",
  "11: Qualification: MBA",
  "12: Job / Bussines: PepsiCo sales job",
  "13: Father's Occupation: govt employee",
  "14: Mother's Occupation: housewife",
  "15: Brothers: 3",
  "16: Sisters: 1",
  "17: Married: 0",
  "18: \\*18: Cell Number:\\*03137738635",
  "19: Parents Number: 03217738635",
  "--------------------",
  "ADDRESS",
  "01: Home Own or Rent: own",
  "02: Size: 5 marla",
  "03: Current City: lahore",
  "04: Location: johar town",
  "05: Home Town: mailsi",
  "06: Other Properties If Any:",
  "--------------------",
  "REQUIREMENTS",
  "01: Age Limit: 23 to 25",
  "02: Height: 5 to 5.4",
  "03: City: any but prefer lahore",
  "04: Caste: any",
  "05: Qualification: graduate",
  "06: Sect: Sunni",
  "07: Any Other Demand: no",
].join("\n");

function checkNumberedPersonalInformation(result) {
  assert.equal(result.data.name, "xyz");
  assert.equal(result.data.gender, "male");
  assert.equal(result.data.marital_status, "unmarried");
  assert.equal(result.data.age, String(new Date().getFullYear() - 1995 - (new Date().getMonth() < 5 || (new Date().getMonth() === 5 && new Date().getDate() < 25) ? 1 : 0)));
  assert.equal(result.data.father_name, "shaharyar jang");
  assert.equal(result.data.caste, "Rajpoot");
  assert.equal(result.data.sect, "Sunni");
  assert.equal(result.data.height, "5.7");
  assert.equal(result.data.qualification, "MBA");
  assert.equal(result.data.job, "PepsiCo sales job");
  assert.equal(result.data.father_occupation, "govt employee");
  assert.equal(result.data.brothers_count, "3");
  assert.equal(result.data.sisters_count, "1");
  assert.equal(result.data.whatsapp_number, "03137738635");
  assert.equal(result.data.parents_whatsapp, "03217738635");
  assert.equal(result.data.house_size, "5 marla");
  assert.equal(result.data.city, "lahore");
  assert.equal(result.data.society, "johar town");
  assert.match(result.data.mother_details, /housewife/);
  assert.match(result.data.other_details, /Home Own or Rent: own/);
  assert.match(result.data.other_details, /Home Town: mailsi/);
  assert.match(result.data.partner_requirements, /Age Limit: 23 to 25/);
  assert.match(result.data.partner_requirements, /Height: 5 to 5\.4/);
  assert.match(result.data.partner_requirements, /City: any but prefer lahore/);
  assert.match(result.data.partner_requirements, /Caste: any/);
  assert.match(result.data.partner_requirements, /Qualification: graduate/);
  assert.match(result.data.partner_requirements, /Sect: Sunni/);
  assert.match(result.data.partner_requirements, /Any Other Demand: no/);
  assert.equal(JSON.stringify(result.data).includes("19008"), false);
  assert.equal(result.unrecognized.length, 0);
}

test("numbered PERSONAL INFORMATION, ADDRESS, and REQUIREMENTS sections parse correctly", () => {
  checkNumberedPersonalInformation(parse(numberedPersonalInformation));
});

test("numbered format handles literal backslash separators and escaped Markdown", () => {
  checkNumberedPersonalInformation(parse(numberedPersonalInformation.replace(/\n/g, "\\")));
});

test("empty address values remain absent and cannot overwrite an existing value", () => {
  const result = parse("ADDRESS\n06: Other Properties If Any:");
  assert.equal(result.data.other_details, undefined);
  const existing = { other_details: "previous properties" };
  assert.deepEqual({ ...existing, ...result.data }, existing);
});

const fixtures = [
  {
    name: "existing Moiz and share format",
    text: "Profile ID: IMB29582\nPERSONAL INFORMATION\nName: Moiz\nGender: Male\nMarital Status: Unmarried\nDate of Birth: 01/02/1995\nFather: Mr Moiz\n\u2753 LIFE PARTNER REQUIREMENTS\nRequirements: Graduate\n\ud83d\udcf1 WHATSAPP CONTACTS\nFather: +923001234567\nMother: 03001234567\nParents: 03009998877\nProfile: 03001112223",
    check(result) {
      assert.equal(result.data.name, "Moiz");
      assert.equal(result.data.father_whatsapp, "+923001234567");
      assert.equal(result.data.whatsapp_number, "03001112223");
      assert.equal(JSON.stringify(result.data).includes("IMB29582"), false);
    },
  },
  {
    name: "emoji-numbered Maria Saeed",
    text: "IMB 32552\n\u0031\ufe0f\u20e3 Name: Maria Saeed\n\u0032\ufe0f\u20e3 Age: 27\n\u0033\ufe0f\u20e3 Height: 5 ft 4 in\n\u0034\ufe0f\u20e3 City You Lived: Lahore\n\u0035\ufe0f\u20e3 Qualification: Masters\n\u0036\ufe0f\u20e3 Demands: Educated\n\u0037\ufe0f\u20e3 Contact Number: +923001234567",
    check(result) {
      assert.equal(result.data.name, "Maria Saeed");
      assert.equal(result.data.city, "Lahore");
      assert.equal(result.data.whatsapp_number, "+923001234567");
      assert.equal(JSON.stringify(result.data).includes("32552"), false);
      assert.match(result.data.partner_requirements, /Educated/);
    },
  },
  {
    name: "triangle-prefixed profile",
    text: "IMB 20593\n\ud83d\udd3a Gender: Male\n\ud83d\udd3a Date of Birth: 11/1997\n\ud83d\udd3a Cast: Rajput\n\ud83d\udd3a Father Name: Ali\n\ud83d\udd3a Contact Person: Uncle\n\ud83d\udd3a Contact Number: 03001234567",
    check(result) {
      assert.equal(result.data.gender, "male");
      assert.equal(result.data.age, undefined);
      assert.match(result.data.other_details, /Contact Person: Uncle/);
      assert.equal(result.data.whatsapp_number, "03001234567");
      assert.equal(JSON.stringify(result.data).includes("20593"), false);
    },
  },
  {
    name: "section-based Mohammad Usman",
    text: "**Mohammad Usman**\nPERSONAL INFORMATION\nGender: Male\nName: Mohammad Usman\nHight: 5 ft 9 in\nMartial Status: Single\nFamily Detail\nBrothers: 2\nSisters: 1\nHome Details\nHouse Size: 10 Marla\nRequirements\npartner Age: 22-28\npartner City: Karachi",
    check(result) {
      assert.equal(result.data.name, "Mohammad Usman");
      assert.equal(result.data.height, "5 ft 9 in");
      assert.equal(result.data.marital_status, "unmarried");
      assert.match(result.data.partner_requirements, /City: Karachi/);
      assert.equal(result.data.city, undefined);
    },
  },
  {
    name: "numbered personal-information profile",
    text: "1. PERSONAL INFORMATION\n1) Gender: Female\n2) Name: Sara\n3) Father's Name: Ahmad\n4) DOB: 1998-05-01\n5) Religion: Islam\nADDRESS\n1. Home Own or Rent: Own\n2. Current City: Karachi\nREQUIREMENTS\nAge Limit: 30\npartner Height: 5 ft 8 in\nCaste: Rajput\nQualification: MBA\nPreferred City: Lahore",
    check(result) {
      assert.equal(result.data.name, "Sara");
      assert.equal(typeof result.data.age, "string");
      assert.equal(result.data.city, "Karachi");
      assert.match(result.data.partner_requirements, /Preferred City: Lahore/);
      assert.match(result.data.partner_requirements, /Caste: Rajput/);
      assert.equal(result.data.caste, undefined);
      assert.equal(result.data.qualification, undefined);
    },
  },
  {
    name: "Candidate's Info profile",
    text: "Candidate's Info\nGender: Male\nName: Ahmed\nDate of Birth: 01 Jan 1990\nEducation: MBA\nMonthly Income: PKR 200,000\nFamily Details\nSiblings Details: 2 brothers, 1 sister; elder brother is married\nResidence Details\nHouse Owned or Rental: Owned\nCurrent Address: DHA Karachi\nRequirements\npartner Education: Graduate",
    check(result) {
      assert.equal(result.data.name, "Ahmed");
      assert.equal(result.data.qualification, "MBA");
      assert.match(result.data.brothers_details, /elder brother is married/);
      assert.match(result.data.society, /DHA Karachi/);
      assert.match(result.data.partner_requirements, /Education: Graduate/);
    },
  },
  {
    name: "numbered section Raja Ali Mehmood Kiyani profile",
    text: "IMB 14258\nPERSONAL INFORMATION\nGender: Male\nName: Raja Ali Mehmood Kiyani\nDate of Birth: 2000-01-01\nEDUCATION DETAILS\nEducation: BS\nOCCUPATION DETAIL\nJob: Engineer\nRELIGION DETAILS\nMaslak/Sect: Sunni\nCast: Kiyani\nRESIDANCE DETAILS\nHome: Owned\nSize: 1 kanal\nCity: Islamabad\nLife Partner REQUIREMENTS\nAge: 20-25\nContact Number: 03001234567",
    check(result) {
      assert.equal(result.data.name, "Raja Ali Mehmood Kiyani");
      assert.equal(result.data.caste, "Kiyani");
      assert.equal(result.data.city, "Islamabad");
      assert.equal(result.data.whatsapp_number, "03001234567");
      assert.equal(JSON.stringify(result.data).includes("14258"), false);
    },
  },
];

for (const fixture of fixtures) {
  test(fixture.name, () => {
    const first = parse(fixture.text);
    const repeated = parse(fixture.text);
    fixture.check(first);
    assert.deepEqual(JSON.parse(JSON.stringify(first)), JSON.parse(JSON.stringify(repeated)));
  });
}

test("empty values do not become parsed form values and incomplete DOB is retained for review", () => {
  const result = parse("Name:\nDate of Birth: 11/1997\nGender: Female");
  assert.equal(result.data.name, undefined);
  assert.equal(result.data.age, undefined);
  assert.equal(result.data.gender, "female");
});

test("candidate age, DOB conversion, and partner age limits remain separate", () => {
  assert.equal(parse("Candidate Age: 31").data.age, "31");
  assert.equal(parse("DOB: 1990-01-01").data.age, String(new Date().getFullYear() - 1990 - (new Date().getMonth() < 0 ? 1 : 0)));
  const partner = parse("Candidate Age: 31\nPartner Age Limit: 25 to 30");
  assert.equal(partner.data.age, "31");
  assert.match(partner.data.partner_requirements, /Age Limit: 25 to 30/);
});

function ageOn(dateOfBirth, now = new Date()) {
  const [year, month, day] = dateOfBirth.split("-").map(Number);
  return String(now.getFullYear() - year - (now.getMonth() + 1 < month || (now.getMonth() + 1 === month && now.getDate() < day) ? 1 : 0));
}

test("DOB date orders are explicit when possible and ambiguous dates are flagged", () => {
  const today = new Date();
  const iso = parse("DOB: 1995-12-25");
  assert.equal(iso.data.age, ageOn("1995-12-25", today));
  assert.equal(parse("DOB: 12-25-1995").data.age, iso.data.age);
  assert.equal(parse("DOB: 25-08-1995").data.age, ageOn("1995-08-25", today));
  assert.equal(parse("DOB: 25/08/1995").data.age, ageOn("1995-08-25", today));
  assert.equal(parse("DOB: 1995/12/25").data.age, iso.data.age);
  assert.equal(parse("DOB: 10-08-1995").data.age, undefined);
  const ambiguous = parse("1️⃣ DOB: 05-08-1995");
  assert.equal(ambiguous.data.age, undefined);
  assert.match(ambiguous.warnings.join(" "), /ambiguous/i);
  assert.equal(parse("Age: 27\nDOB: 05-08-1995").data.age, "27");
});

test("invalid and future DOB values never produce an age", () => {
  for (const dob of ["31-02-1995", "13-13-1995", "1995-02-29", "11/1997", "2999-01-01"]) {
    assert.equal(parse(`Date of Birth: ${dob}`).data.age, undefined, dob);
  }
});

const jahangeerAhmedProfile = `IMB 24477

1️⃣ PERSONAL INFORMATION
Gender: Male
Name:Jahangeer Ahmed
Marital Status: single
DOB: 5-aug-1995
Height: 6 feet
Qualification: B. Com

3️⃣ OCCUPATION DETAIL:
Job/Business:Business(pharmacy)

4️⃣ RELIGION DETAILS:
Religion: Islam
Sect: sunni
Cast: sheikh

5️⃣ RESIDANCE DETAILS:
Home Own/On Rent:rent+own 10 marla plot
Size: 10 marla
City:Lahore
Address: House no P 33 Marghazar Officers colony Lahore
Nationality :Pakistani

6️⃣ FAMILY DETAILS:
Father's Occupation private job
Mother Occupation house wife
Brothers: 1
Sisters: 2
Married: 1 sister

7️⃣ YOUR REQUIREMENTS:
Height 5'7
Ability :cooking
Education :graduation
WhatsApp +92 322 4994861
Contact no 03204634735`;

test("complete Jahangeer Ahmed profile maps DOB age through the UI field and save payload", () => {
  const result = parse(jahangeerAhmedProfile, new Date(2026, 9, 28, 12));
  assert.equal(result.data.name, "Jahangeer Ahmed");
  assert.equal(result.data.gender, "male");
  assert.equal(result.data.age, "31");
  assert.equal(JSON.stringify(result.data).includes("24477"), false);

  // Mirrors ProfileForm.fillFromParsedProfile and its controlled values.age binding.
  const formState = { name: "", age: "", gender: "" };
  const manuallyEditedFields = new Set();
  const mappedState = { ...formState, ...Object.fromEntries(Object.entries(result.data).filter(([key]) => !manuallyEditedFields.has(key))) };
  assert.equal(mappedState.age, "31");

  // Mirrors ProfileForm.handleSubmit, which serializes every state entry into FormData.
  const payload = new Map(Object.entries(mappedState));
  assert.equal(payload.get("age"), "31");
});

test("text month DOB accepts abbreviated, full, hyphenated, and year-first forms", () => {
  for (const dob of ["5-aug-1995", "05-Aug-1995", "5 August 1995", "5-August-1995", "1995-08-05"]) {
    assert.equal(parse(`Date of Birth : ${dob}`).data.age, "31", dob);
  }
});

test("Maria Saeed mappings keep education, contacts, and sibling counts in their fields", () => {
  const result = parse(mariaSaeedExact);
  assert.equal(result.data.sect, "Ahl e Hadees");
  assert.equal(result.data.caste, "Mughal");
  assert.equal(result.data.qualification, "ADP arts");
  assert.equal(result.data.educational_institution, "Shahada ul Aalmiya (Wafaq ul Madariss)");
  assert.equal(result.data.height, '5"');
  assert.equal(result.data.father_occupation, "Not Alive");
  assert.equal(result.data.job, "Teacher at Jamiya");
  assert.equal(result.data.city, "Lahore");
  assert.equal(result.data.society, "Lahore");
  assert.equal(result.data.sisters_count, "2");
  assert.equal(result.data.brothers_count, "3");
  assert.equal(result.data.whatsapp_number, "0332 0707447");
  assert.equal(result.data.mother_whatsapp, "03009476073");
  assert.equal(result.unrecognized.length, 0);
});

test("including-me sibling count excludes candidate only when candidate gender is explicit", () => {
  const female = parse("Gender: Female\nSiblings: 2 Sister 3 Brothers (including me)");
  assert.equal(female.data.sisters_count, "1");
  assert.equal(female.data.brothers_count, "3");
  const male = parse("Gender: Male\nSiblings: 2 Sister 3 Brothers (including me)");
  assert.equal(male.data.sisters_count, "2");
  assert.equal(male.data.brothers_count, "2");
});
