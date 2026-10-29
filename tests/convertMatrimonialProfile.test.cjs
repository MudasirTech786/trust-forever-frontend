/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const parserFile = path.join(__dirname, "../src/lib/parseMatrimonialProfile.ts");
const converterFile = path.join(__dirname, "../src/lib/convertMatrimonialProfile.ts");
function loadTs(file, dependencies = {}) {
  const compiled = ts.transpile(fs.readFileSync(file, "utf8"), { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 });
  const module = { exports: {} };
  vm.runInNewContext(compiled, { exports: module.exports, module, require: (id) => dependencies[id] ?? require(id) });
  return module.exports;
}
const parser = loadTs(parserFile);
const converter = loadTs(converterFile, { "@/lib/parseMatrimonialProfile": parser });

const fullProfile = `IMB 24477
1️⃣ PERSONAL INFORMATION
Gender: Male
Name: Jahangeer Ahmed
Marital Status: single
DOB: 5-aug-1995
Height: 6 feet
Qualification: B. Com
EDUCATION DETAILS
Religious Education: Shahada ul Aalmiya
3️⃣ OCCUPATION DETAIL:
Job/Business: Business(pharmacy)
4️⃣ RELIGION DETAILS:
Sect: sunni
Cast: sheikh
5️⃣ RESIDANCE DETAILS:
Size: 10 marla
City: Lahore
6️⃣ FAMILY DETAILS:
Father's Name: Ahmed
Father's Occupation: private job
Brothers: 1
Sisters: 2
Married Sisters: 1
7️⃣ YOUR REQUIREMENTS:
Height: 5'7
Demands: Educated\nGood family
Parents WhatsApp: 03001234567`;

test("converts a sectioned emoji profile in the required order and round-trips via Auto-Fill parser", () => {
  const converted = converter.convertMatrimonialProfileText(fullProfile);
  const lines = converted.text.split("\n");
  assert.equal(lines[0], "*Personal information*📝");
  assert.equal(lines[1], "Gender: male");
  assert.equal(lines[2], "Marital Status: unmarried");
  assert.equal(lines[3], "Name: Jahangeer Ahmed");
  assert.equal(lines[4], "DOB: 5-aug-1995");
  assert.ok(converted.text.indexOf("*Family details*") < converted.text.indexOf("*Life partner Requirements*"));
  assert.equal(converted.text.includes("24477"), false);
  const parsed = parser.parseMatrimonialProfileText(converted.text, new Date(2026, 9, 28, 12));
  assert.equal(parsed.data.name, "Jahangeer Ahmed");
  assert.equal(parsed.data.age, "31");
  assert.equal(parsed.data.father_name, "Ahmed");
  assert.equal(parsed.data.father_occupation, "private job");
  assert.equal(parsed.data.sisters_count, "2");
  assert.equal(parsed.data.married_sisters_count, "1");
  assert.equal(parsed.data.parents_whatsapp, "03001234567");
  assert.match(parsed.data.partner_requirements, /Good family/);
});

test("age-only profiles retain explicit Age and Auto-Fill recovers it", () => {
  const converted = converter.convertMatrimonialProfileText("Profile ID: IMB29582\nName: Sara\nAge: 27\nPhone: 03001234567");
  assert.match(converted.text, /Name: Sara\nAge: 27\n/);
  assert.doesNotMatch(converted.text, /DOB:/);
  assert.equal(converted.text.includes("IMB29582"), false);
  const parsed = parser.parseMatrimonialProfileText(converted.text);
  assert.equal(parsed.data.age, "27");
});

test("bare WhatsApp and Contact no labels stay in the contact field", () => {
  const parsed = parser.parseMatrimonialProfileText("WhatsApp +92 322 4994861\nContact no 03204634735");
  assert.match(parsed.data.whatsapp_number, /\+92 322 4994861/);
  assert.match(parsed.data.parents_whatsapp, /03204634735/);
});

test("parents WhatsApp block keeps adjacent phones as separate values and warns about unknown owner", () => {
  const source = "Parents Whatsapp nbrs: Contact: +92 322 4994861\n03204634735";
  const converted = converter.convertMatrimonialProfileText(source);
  assert.doesNotMatch(converted.text, /49948610320434735/);
  const parsed = parser.parseMatrimonialProfileText(converted.text);
  const phones = [parsed.data.whatsapp_number, parsed.data.parents_whatsapp, parsed.data.father_whatsapp, parsed.data.mother_whatsapp].filter(Boolean);
  assert.equal(phones.length, 2);
  assert.ok(phones.includes("+92 322 4994861"));
  assert.ok(phones.includes("03204634735"));
  assert.ok(converted.warnings.some((warning) => /owner is unclear/i.test(warning)) || parsed.warnings.some((warning) => /owner is unclear/i.test(warning)));
  const finalFormState = { whatsapp_number: "", parents_whatsapp: "", father_whatsapp: "", mother_whatsapp: "", ...parsed.data };
  assert.equal(finalFormState.whatsapp_number, "+92 322 4994861");
  assert.equal(finalFormState.parents_whatsapp, "03204634735");
  assert.notEqual(finalFormState.whatsapp_number + finalFormState.parents_whatsapp, "+92 322 49948610320434735");
});

test("labeled family contacts map correctly and multiple same-line numbers remain distinct", () => {
  const sameLine = parser.parseMatrimonialProfileText("Contact: +92 322 4994861, 03204634735");
  assert.equal(sameLine.data.whatsapp_number, "+92 322 4994861");
  assert.equal(sameLine.data.parents_whatsapp, "03204634735");
  const labeled = parser.parseMatrimonialProfileText("Father WhatsApp: 0300 9476073\nMother WhatsApp: 03001234567");
  assert.equal(labeled.data.father_whatsapp, "0300 9476073");
  assert.equal(labeled.data.mother_whatsapp, "03001234567");
});

test("complete profile keeps candidate and partner details separate and preserves family information", () => {
  const sample = `IMB 24477
PERSONAL INFORMATION
Name: Jahangeer Ahmed
Height: 6 feet
Qualification: B. Com
3️⃣ OCCUPATION DETAIL:
Job/Business: Business(pharmacy)
4️⃣ RELIGION DETAILS:
Religion: Islam
Nationality: Pakistani
6️⃣ FAMILY DETAILS:
Mother Occupation: house wife
Married: 1 sister
7️⃣ YOUR REQUIREMENTS:
Height: 5'7
Education: graduation`;
  const converted = converter.convertMatrimonialProfileText(sample);
  assert.match(parser.parseMatrimonialProfileText(sample).data.mother_details, /house wife/);
  assert.match(converted.text, /Height: 6 feet/);
  assert.match(converted.text, /Life partner Requirements:[\s\S]*Height: 5'7/);
  assert.match(converted.text, /Qualifications: B\. Com/);
  assert.match(converted.text, /Life partner Requirements:[\s\S]*Education: graduation/);
  assert.match(converted.text, /Mother Occupation: house wife/);
  assert.match(converted.text, /Religion: Islam/);
  assert.match(converted.text, /Nationality: Pakistani/);
  assert.match(converted.text, /Married: 1 sister/);
  const filled = parser.parseMatrimonialProfileText(converted.text);
  assert.equal(filled.data.height, "6 feet");
  assert.match(filled.data.partner_requirements, /Height: 5'7/);
  assert.match(filled.data.partner_requirements, /Education: graduation/);
  assert.match(filled.data.mother_details, /Mother Occupation: house wife/);
});

test("missing fields remain present and blank, while numeric DOB ambiguity is warned", () => {
  const converted = converter.convertMatrimonialProfileText("Name: A\nDOB: 05-08-1995");
  assert.match(converted.text, /Gender: \nMarital Status: \nName: A\nHeight: \n/);
  assert.doesNotMatch(converted.text, /(?:Age|DOB):/);
  assert.ok(converted.warnings.some((warning) => /ambiguous/i.test(warning)));
});

test("preserves source Age and DOB independently, with Age-only and DOB-only conversion", () => {
  const maria = converter.convertMatrimonialProfileText("2️⃣⭕ *Age* 27\nName: Maria Saeed");
  assert.match(maria.text, /Name: Maria Saeed\nAge: 27\n/);
  assert.doesNotMatch(maria.text, /DOB:/);
  assert.equal(parser.parseMatrimonialProfileText(maria.text).data.age, "27");

  const isoDob = converter.convertMatrimonialProfileText("Name: Jahangeer Ahmed\nDate of Birth: 1995-08-05");
  assert.match(isoDob.text, /Name: Jahangeer Ahmed\nDOB: 1995-08-05\n/);
  assert.doesNotMatch(isoDob.text, /Age:/);
  assert.equal(parser.parseMatrimonialProfileText(isoDob.text).data.age, String(new Date().getFullYear() - 1995 - (new Date().getMonth() < 7 || (new Date().getMonth() === 7 && new Date().getDate() < 5) ? 1 : 0)));

  const both = converter.convertMatrimonialProfileText("Age: 27\nDOB: 1995-08-05");
  assert.match(both.text, /Age: 27\nDOB: 1995-08-05/);
  const reparsed = parser.parseMatrimonialProfileText(both.text);
  assert.equal(reparsed.data.age, "27");
  assert.equal(reparsed.dob, "1995-08-05");

  const neither = converter.convertMatrimonialProfileText("Name: Unknown\nIMB 24477");
  assert.doesNotMatch(neither.text, /(?:Age|DOB):/);
  assert.equal(parser.parseMatrimonialProfileText(neither.text).data.age, undefined);
});

test("preserves partial DOB text and only calculates a month/year age when reliable", () => {
  const reference = new Date(2026, 9, 28, 12);
  const partialDates = ["11/1997", "11-1997", "Nov 1997", "November 1997", "1997-11", "1997"];
  for (const date of partialDates) {
    const converted = converter.convertMatrimonialProfileText(`IMB 32552\n🔺Date of Birth: ${date}`, reference);
    assert.ok(converted.text.includes(`DOB: ${date}`), date);
    assert.doesNotMatch(converted.text, /Age:/, date);
    const filled = parser.parseMatrimonialProfileText(converted.text, reference);
    assert.equal(filled.dob, date);
    if (date === "11/1997" || date === "11-1997" || date === "Nov 1997" || date === "November 1997" || date === "1997-11") assert.equal(filled.data.age, "28", date);
    else assert.equal(filled.data.age, undefined);
  }
  const inBirthMonth = parser.parseMatrimonialProfileText("DOB: 11/1997", new Date(2026, 10, 15, 12));
  assert.equal(inBirthMonth.data.age, undefined);
  assert.ok(inBirthMonth.warnings.some((warning) => /exact age was not calculated/i.test(warning)));
});

test("complete numeric and textual DOB forms remain valid and preserve source formatting", () => {
  const reference = new Date(2026, 9, 28, 12);
  for (const date of ["1997-11-15", "15-11-1997", "11-15-1997", "5-aug-1995"]) {
    const converted = converter.convertMatrimonialProfileText(`Birth Date: ${date}`, reference);
    assert.ok(converted.text.includes(`DOB: ${date}`), date);
    assert.equal(parser.parseMatrimonialProfileText(converted.text, reference).dob, date);
  }
});

test("converter canonicalizes DOB label punctuation and casing without changing its value", () => {
  const labels = [
    "date of birth", "Date Of Birth", "Date of birth", "DATE OF BIRTH",
    "Date Of birth ", "Date-of-Birth", "Date_of_Birth", "Birth Date", "DOB",
  ];
  for (const label of labels) {
    const source = `Name: Sara\n${label}: 1995-08-05`;
    const converted = converter.convertMatrimonialProfileText(source);
    assert.equal((converted.text.match(/^DOB: 1995-08-05$/gm) || []).length, 1, label);
    assert.doesNotMatch(converted.text, /^(?:Date of Birth|Birth Date):/im, label);
    const copiedText = converted.text;
    assert.ok(copiedText.includes("DOB: 1995-08-05"), label);
  }

  const preserved = converter.convertMatrimonialProfileText("Age: 27\nDate_of_Birth: 11/1997\nDOB: 11/1997");
  assert.match(preserved.text, /Age: 27\nDOB: 11\/1997\n/);
  assert.equal((preserved.text.match(/^DOB: 11\/1997$/gm) || []).length, 1);

  const unrelated = converter.convertMatrimonialProfileText("Name: Date of Birth House\nRequirements: date of birth details\nPhone: 1995-08-05");
  assert.doesNotMatch(unrelated.text, /^DOB:/m);
});

test("DOB labels without separators are consumed and normalized once", () => {
  const variants = [
    "Date of birth 25/12/1993", "Date of birth: 25/12/1993", "Date Of Birth: 25/12/1993",
    "Date Of Birth 25/12/1993", "DATE OF BIRTH - 25/12/1993", "Date-of-Birth: 25/12/1993",
    "Date_of_Birth: 25/12/1993", "DOB 25/12/1993", "DOB: 25/12/1993", "Birth Date 25/12/1993",
    "🔺 1. Date of birth 25/12/1993",
  ];
  for (const line of variants) {
    const result = parser.parseMatrimonialProfileText(line);
    assert.equal(result.dob, "25/12/1993", line);
    assert.equal(result.unrecognized.length, 0, line);
    const converted = converter.convertMatrimonialProfileText(line);
    assert.equal((converted.text.match(/^DOB: 25\/12\/1993$/gm) || []).length, 1, line);
    assert.doesNotMatch(converted.text, /^Date of birth 25\/12\/1993$/m, line);
  }
  assert.equal(parser.parseMatrimonialProfileText("Date of birth 11/1997").dob, "11/1997");
  assert.equal(parser.parseMatrimonialProfileText("Age: 27").ageExplicit, true);
});

test("Raja profile section values map to candidate fields without duplicating DOB", () => {
  const source = `IMB 14258
PERSONAL INFORMATION
Gender: Male
Marital Status: single
Name: Raja ali mehmood kiyani
Date of birth 25/12/1993
Height: 5.9
Maslak/Sect:Sunni
Caste: Rajpoot
2ï¸âƒ£ EDUCATION DETAILS:
B.com
3ï¸âƒ£ OCCUPATION DETAIL:
Job: Government Lesco wapda
Income: Alhumdulillah
Size of house: 7 Marla +own market and houses, and service station own.
City: Lahore
Father:own business
7ï¸âƒ£ YOUR REQUIREMENTS:
Education: Graduate
Contact Number: 03001234567`;
  const parsed = parser.parseMatrimonialProfileText(source, new Date(2026, 9, 28, 12));
  assert.equal(parsed.dob, "25/12/1993");
  assert.equal(parsed.data.sect, "Sunni");
  assert.equal(parsed.data.qualification, "B.com");
  assert.equal(parsed.data.father_occupation, "own business");
  assert.doesNotMatch(parsed.data.father_name || "", /own business/i);
  assert.equal(parsed.unrecognized.some((line) => /Date of birth 25\/12\/1993/.test(line)), false);
  const converted = converter.convertMatrimonialProfileText(source, new Date(2026, 9, 28, 12));
  assert.match(converted.text, /DOB: 25\/12\/1993/);
  assert.match(converted.text, /Sect: Sunni/);
  assert.match(converted.text, /Qualifications: B\.com/);
  assert.equal((converted.text.match(/^DOB:/gm) || []).length, 1);
  assert.doesNotMatch(converted.text, /Date of birth 25\/12\/1993/);
  assert.match(converted.text, /Father occupation: own business/);
  assert.match(converted.text, /Life partner Requirements:[\s\S]*Education: Graduate/);
});
