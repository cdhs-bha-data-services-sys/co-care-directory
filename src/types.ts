import { LatLngLiteral } from "leaflet";

export type DailyHours =
  | {
      open: true;
      start: string;
      end: string;
    }
  | { open: false };

export type WeeklyHours = {
  sunday: DailyHours;
  monday: DailyHours;
  tuesday: DailyHours;
  wednesday: DailyHours;
  thursday: DailyHours;
  friday: DailyHours;
  saturday: DailyHours;
} | null;

export const SUBSTANCE_USE_SERVICES = [
  "ClinicallyManagedHighIntensityResidentialServices",
  "ClinicallyManagedLowIntensityResidentialServices",
  "ClinicallyManagedMediumIntensityResidentialServices",
  "ClinicallyManagedResidentialDetoxification",
  "DayTreatment(PartialHospitalization)",
  "DUI/DWI",
  "Education&TreatmentServicesforPersonsinCriminalJusticeSystem",
  "GenderResponsiveTreatmentforWomen",
  "GeneralTreatment",
  "IntensiveOutpatient",
  "MedicallyMonitoredInpatientDetoxification",
  "MedicallyMonitoredIntensiveResidentialTreatment",
  "MedicationAssistedTherapy",
  "OpioidTreatmentPrograms",
  "Outpatient",
  "YouthTreatment",
] as const;
export type SubstanceUseServices = typeof SUBSTANCE_USE_SERVICES[number];

export const MENTAL_HEALTH_SERVICES = [
  "72-HourTreatment&Evaluation",
  "AcuteTreatmentUnit",
  "CommunityMentalHealthCenter",
  "CommunityMentalHealthClinic",
  "CrisisStabilizationUnit",
  "DayTreatment",
  "Emergency",
  "Hospital",
  "IntensiveOutpatient",
  "Outpatient",
  "PsychiatricResidential",
  "ResidentialChildCareFacility",
  "ResidentialLongTermTreatment",
  "ResidentialShortTermTreatment",
] as const;
export type MentalHealthServices = typeof MENTAL_HEALTH_SERVICES[number];

export const POPULATIONS_SERVED = [
  "Homeless",
  "LGBT",
  "Men",
  "Military",
  "OlderAdults",
  "PregnantWomen",
  "Women",
  "Youth",
  "Offender",
  "Minors/Adolescents",
  "ClientsreferredfromCourt/JudicialSystem",
  "AmericanIndian",
  "HIV",
];
export type PopulationsServed = typeof POPULATIONS_SERVED[number];

export const ACCESSIBILITY_OPTIONS = [
  "Deaf/HardofHearing",
  "VisuallyImpaired",
  "Wheelchair",
] as const;
export type AccessibilityOptions = typeof ACCESSIBILITY_OPTIONS[number];

export const FEES = [
  "Medicaid",
  "PrivateInsurance",
  "SelfPay",
  "SlidingFeeScale",
] as const;
export type Fees = typeof FEES[number];
// these represent user ability to pay, which is slightly different from Fees
export type FeePreference = Exclude<Fees, "SelfPay">;

export const LANGUAGES = [
  "English",
  "Spanish",
  "Vietnamese",
  "German",
  "Russian",
  "Polish",
  "Ukrainian",
  "French",
  "Mandarin",
  "Cambodian",
  "Mongolian",
  "Cantonese",
] as const;
export type Languages = typeof LANGUAGES[number];

export type CareProvider = {
  id: string;
  name: string;
  programName: string;
  phone: string;
  hideAddress: boolean;
  address: string[];
  website: string;
  substanceUse: {
    supported: boolean;
    duiSupported: boolean;
    services: { [key in SubstanceUseServices]: boolean };
  };
  mentalHealth: {
    supported: boolean;
    services: { [key in MentalHealthServices]: boolean };
  };
  populationsServed: { [key in PopulationsServed]: boolean };
  hours: WeeklyHours;
  accessibility: { [key in AccessibilityOptions]: boolean };
  fees: { [key in Fees]: boolean };
  languages: { [key in Languages]: boolean };
  latlng: [number, number] | null;
};

export type CareProviderSearchMetadata = {
  distance?: number;
};

export type CareProviderSearchResult = CareProvider &
  CareProviderSearchMetadata;

export type SearchResult = {
  results: CareProviderSearchResult[];
};

export interface ZipData {
  [key: string]: {
    PO_NAME: string;
    STATE: string;
    POPULATION: number | null;
    POP_SQMI: number | null;
    SQMI: number;
    centroid_lon: number;
    centroid_lat: number;
  };
}

export type ZipSearchMetadata =
  | { isValidZip: false }
  | { isValidZip: true; defaultRadiusMiles: number; center: LatLngLiteral };

export type SearchFilters = {
  zip: string;
  miles: string;
  typesOfHelp: TypeOfHelp[];
  feePreferences: FeePreference[];
  accessibility: AccessibilityOptions[];
};

export enum TypeOfHelp {
  SubstanceUse = "substance_use",
  CourtMandatedTreatment = "court_mandated_treatment",
  MentalHealth = "mental_health",
  SuicidalIdeation = "suicidal_ideation",
  Unsure = "unsure",
  None = "none",
}
