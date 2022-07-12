import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";
import {
  ACCESSIBILITY_OPTIONS,
  CareProvider,
  DailyHours,
  FEE_PREFERENCES,
  LANGUAGES,
  MENTAL_HEALTH_SERVICES,
  POPULATIONS_SERVED,
  SUBSTANCE_USE_SERVICES,
  WeeklyHours,
} from "../types";
import { LatLngLiteral } from "leaflet";

const INPUT_FILE = "../../raw_data/ladders.csv";
const OUTPUT_FILE = "./ladders_data.json";

type InputRow = {
  "Parent Account ID": string;
  "Account ID": string;
  "OBH General Acct": string;
  "Account Name": string;
  "Program Name": string;
  "Original Date of Licensure": string;
  "SUD License Number": string;
  "CS License Number": string;
  "MH Designation": string;
  Phone: string;
  Fax: string;
  "TDD/TTY": string;
  "Billing Address Line 1": string;
  "Billing City": string;
  County: string;
  "Billing Zip/Postal Code": string;
  "Billing State/Province": string;
  "Hide Address": string;
  "Provider Location Display Label": string;
  Website: string;
  "Active SUD License": string;
  "Active MH Designation": string;
  "Opioid Treatment Programs": string;
  "Residential Child Care Facility": string;
  Hospital: string;
  "Community Mental Health Center": string;
  "Community Mental Health Clinic": string;
  "Psychiatric Residential": string;
  "Substance Use Services": string;
  "Mental Health Settings": string;
  "Population Served": string;
  Accessibility: string;
  "Fee(s)": string;
  "Languages Spoken": string;
  "Hours of Operation Monday": string;
  "Hours of Operation Tuesday": string;
  "Hours of Operation Wednesday": string;
  "Hours of Operation Thursday": string;
  "Hours of Operation Friday": string;
  "Hours of Operation Saturday": string;
  "Hours of Operation Sunday": string;
  "Outpatient - SU Services": string;
  "Day Treatment (Partial Hospitalization)": string;
  "Intensive Outpatient - SU Services": string;
  "Clinic Managed Low Intense Res Svcs": string;
  "Clinic Managed Med Intense Res Svcs": string;
  "Clinic Managed High Intense Res Svcs": string;
  "Medically Monitored Intense Res Trtmt": string;
  "Clinic Managed Residential Detox": string;
  "Med Monitored Inpatient Detox": string;
  "72-Hour Treatment & Evaluation": string;
  "Acute Treatment Unit": string;
  "Crisis Stabilization Unit": string;
  "Day Treatment": string;
  Emergency: string;
  "Intensive Outpatient": string;
  Outpatient: string;
  "Residential Short Term Treatment": string;
  "Residential Long Term Treatment": string;
  "CIRCLE Program": string;
  "MSO Affiliation": string;
  RAE: string;
  ASO: string;
  "Alcohol & Drug Involuntary Commitment": string;
  "General Treatment": string;
  "DUI/DWI": string;
  "Youth Treatment": string;
  "Gender Responsive Ttmt for Women": string;
  "Edu&Ttmt Svcs for Persons in CJS": string;
  "Provider Directory Form Modified Date": string;
  lat: string;
  lon: string;
};

const splitBySemicolons = (input: string): string[] => {
  return input ? input.split(";").map((str) => str.trim()) : [];
};

function getBooleanMap<T extends string>(keys: readonly T[], values: string[]) {
  const stripped = values.map((val) => val.replaceAll(" ", ""));
  stripped.forEach((val) => {
    if (!keys.includes(val as T)) {
      console.log(
        `value ${val} found but missing from type: ${keys.join(", ")}`
      );
    }
  });
  return keys.reduce((boolMap, key) => {
    boolMap[key] = stripped.includes(key);
    return boolMap;
  }, {} as { [key in T]: boolean });
}

const getDailyHours = (hoursString: string): DailyHours => {
  if (!hoursString) {
    return { open: false };
  } else {
    const parts = hoursString.split(" - ");
    if (parts.length !== 2) {
      throw new Error(`cannot parse hours: ${hoursString}`);
    }
    return {
      open: true,
      start: parts[0],
      end: parts[1],
    };
  }
};

const getHoursOfOperation = (row: InputRow): WeeklyHours => {
  const hoursOfOperation = {
    sunday: getDailyHours(row["Hours of Operation Sunday"]),
    monday: getDailyHours(row["Hours of Operation Monday"]),
    tuesday: getDailyHours(row["Hours of Operation Tuesday"]),
    wednesday: getDailyHours(row["Hours of Operation Wednesday"]),
    thursday: getDailyHours(row["Hours of Operation Thursday"]),
    friday: getDailyHours(row["Hours of Operation Friday"]),
    saturday: getDailyHours(row["Hours of Operation Saturday"]),
  };
  // if hours are missing for every day, treat hours of operation as unknown.
  // otherwise, missing hours can reliably mean closed
  if (Object.values(hoursOfOperation).every((v) => v.open === false)) {
    return null;
  }
  return hoursOfOperation;
};

const getLatLng = (row: InputRow): LatLngLiteral | null => {
  const lat = parseFloat(row.lat);
  const lng = parseFloat(row.lon);
  if (!!(lat && lng)) {
    return { lat, lng };
  }

  return null;
};

const transformRow = (row: InputRow): CareProvider => {
  const hideAddress = !!(row["Hide Address"] === "1");
  const substanceUseServices = splitBySemicolons(row["Substance Use Services"]);
  const mentalHealthServices = splitBySemicolons(row["Mental Health Settings"]);
  const cleaned = {
    id: row["Account ID"],
    name: row["Account Name"],
    programName: row["Program Name"],
    phone: row["Phone"],
    hideAddress,
    address:
      hideAddress || !row["Provider Location Display Label"]
        ? []
        : row["Provider Location Display Label"].split("_BR_ENCODED_"),
    website:
      row["Website"] && !row["Website"].startsWith("http")
        ? `https://${row["Website"]}`
        : row["Website"],
    substanceUse: {
      supported: !!(
        substanceUseServices.length ||
        row["Active SUD License"] === "1" ||
        row["Opioid Treatment Programs"] === "1"
      ),
      duiSupported: row["DUI/DWI"] === "1",
      services: getBooleanMap(SUBSTANCE_USE_SERVICES, substanceUseServices),
    },
    mentalHealth: {
      supported: !!(
        mentalHealthServices.length ||
        row["Active MH Designation"] === "1" ||
        row["Community Mental Health Center"] === "1" ||
        row["Community Mental Health Clinic"] === "1"
      ),
      services: getBooleanMap(MENTAL_HEALTH_SERVICES, mentalHealthServices),
    },
    populationsServed: getBooleanMap(
      POPULATIONS_SERVED,
      splitBySemicolons(row["Population Served"])
    ),
    hours: getHoursOfOperation(row),
    accessibility: getBooleanMap(
      ACCESSIBILITY_OPTIONS,
      splitBySemicolons(row["Accessibility"])
    ),
    fees: getBooleanMap(FEE_PREFERENCES, splitBySemicolons(row["Fee(s)"])),
    languages: getBooleanMap(
      LANGUAGES,
      splitBySemicolons(row["Languages Spoken"])
    ),
    latlng: getLatLng(row),
  };
  return cleaned;
};

const csvPath = path.resolve(__dirname, INPUT_FILE);
const csvFileContent = fs.readFileSync(csvPath);
const rows = parse(csvFileContent, {
  columns: true,
});
const cleanedData = rows.map((row: InputRow) => {
  return transformRow(row);
});
fs.writeFileSync(
  path.resolve(__dirname, OUTPUT_FILE),
  JSON.stringify(cleanedData)
);
