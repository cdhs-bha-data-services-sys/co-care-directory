import { LatLngTuple } from "leaflet";
import {
  AccessibilityOptions,
  ACCESSIBILITY_OPTIONS,
  CareProvider,
  Fees,
  FEES,
  Languages,
  LANGUAGES,
  MentalHealthServices,
  MENTAL_HEALTH_SERVICES,
  PopulationsServed,
  POPULATIONS_SERVED,
  SubstanceUseServices,
  SUBSTANCE_USE_SERVICES,
} from "./types";
import {
  DEFAULT_RADIUS_MILES,
  addSearchMetadata,
  isWithinRadius,
  compareDistance,
  getMatchingCare,
} from "./util";

const DUMMY_CARE_PROVIDER: CareProvider = {
  id: "1",
  name: "Care Provider",
  programName: "Care Provider",
  phone: "123-456-7890",
  hideAddress: false,
  address: [],
  website: "",
  substanceUse: {
    supported: false,
    duiSupported: false,
    services: SUBSTANCE_USE_SERVICES.reduce((map, val) => {
      map[val] = false;
      return map;
    }, {} as { [key in SubstanceUseServices]: boolean }),
  },
  mentalHealth: {
    supported: false,
    services: MENTAL_HEALTH_SERVICES.reduce((map, val) => {
      map[val] = false;
      return map;
    }, {} as { [key in MentalHealthServices]: boolean }),
  },
  populationsServed: POPULATIONS_SERVED.reduce((map, val) => {
    map[val] = false;
    return map;
  }, {} as { [key in PopulationsServed]: boolean }),
  hours: null,
  accessibility: ACCESSIBILITY_OPTIONS.reduce((map, val) => {
    map[val] = false;
    return map;
  }, {} as { [key in AccessibilityOptions]: boolean }),
  fees: FEES.reduce((map, val) => {
    map[val] = false;
    return map;
  }, {} as { [key in Fees]: boolean }),
  languages: LANGUAGES.reduce((map, val) => {
    map[val] = false;
    return map;
  }, {} as { [key in Languages]: boolean }),
  latlng: null,
};

// An invalid zipcode
const INVALID_ZIP = "123";
// A zipcode in NY
const VALID_NOT_CO_ZIP = "10001";
// A zipcode in Denver, CO
const VALID_CO_ZIP = "80205";
// A point close to Denver zipcode center, within DEFAULT_RADIUS
const CLOSE: LatLngTuple = [39.74881, -104.946169];
// A point further away from Denver zipcode center, within DEFAULT_RADIUS
const FURTHER: LatLngTuple = [39.751298, -105.000184];
// A point further away from Denver zipcode radius, outside DEFAULT_RADIUS
const FAR: LatLngTuple = [37.938865, -107.812949];

describe("addSearchMetadata", () => {
  test("it adds distance to CareProviders with lat/lng data", () => {
    const DATA = [
      {
        ...DUMMY_CARE_PROVIDER,
        id: "no-distance",
      },
      {
        ...DUMMY_CARE_PROVIDER,
        latlng: FURTHER,
        id: "distance",
      },
    ];
    const results = addSearchMetadata(DATA, CLOSE);

    // All data should be returned
    expect(results).toHaveLength(2);

    // Entity without lat/lng data should have distance = undefined
    const noDistance = results.find((result) => result.id === "no-distance");
    expect(noDistance).toHaveProperty("distance");
    expect(noDistance?.distance).toBeUndefined();

    // Entity with lat/lng data should have distance = some positive number
    const distance = results.find((result) => result.id === "distance");
    expect(distance).toHaveProperty("distance");
    expect(distance?.distance).not.toBeUndefined();
    expect(distance?.distance).toBeGreaterThan(0);
  });
});

describe("isWithinRadius", () => {
  test.each([
    [100, 5, true],
    [100000, 5, false],
  ])(
    "it returns true if distance is < miles",
    (distanceMeters, radiusMiles, expected) => {
      const result = isWithinRadius(
        { ...DUMMY_CARE_PROVIDER, distance: distanceMeters },
        radiusMiles
      );
      expect(result).toEqual(expected);
    }
  );
});

describe("compareDistance", () => {
  test("it returns CareProviders sorted by distance with undefined at the end", () => {
    const sorted = [
      { ...DUMMY_CARE_PROVIDER, id: "undefined" },
      { ...DUMMY_CARE_PROVIDER, id: "one", distance: 1 },
      { ...DUMMY_CARE_PROVIDER, id: "one hundred", distance: 100 },
    ].sort(compareDistance);

    expect(sorted[0].id).toEqual("one");
    expect(sorted[1].id).toEqual("one hundred");
    expect(sorted[2].id).toEqual("undefined");
  });
});

describe("getMatchingCare", () => {
  describe("bad zip", () => {
    test("it returns no results if provided zip is not valid - length < 5", () => {
      const { results } = getMatchingCare([DUMMY_CARE_PROVIDER], {
        zip: INVALID_ZIP,
        miles: `${DEFAULT_RADIUS_MILES}`,
        typesOfHelp: [],
        feePreferences: [],
      });
      expect(results.length).toEqual(0);
    });

    test("it returns no results if provided zip is not valid - not in CO list", () => {
      const { results } = getMatchingCare([DUMMY_CARE_PROVIDER], {
        zip: VALID_NOT_CO_ZIP,
        miles: `${DEFAULT_RADIUS_MILES}`,
        typesOfHelp: [],
        feePreferences: [],
      });
      expect(results.length).toEqual(0);
    });
  });

  test("it returns CareProviders within radius, excluding those that are too far or do not have lat/lng data", () => {
    const DATA = [
      {
        ...DUMMY_CARE_PROVIDER,
        id: "no-distance",
      },
      {
        ...DUMMY_CARE_PROVIDER,
        id: "close",
        latlng: CLOSE,
      },
      {
        ...DUMMY_CARE_PROVIDER,
        id: "further",
        latlng: FURTHER,
      },
      {
        ...DUMMY_CARE_PROVIDER,
        id: "far",
        latlng: FAR,
      },
    ];

    const { results } = getMatchingCare(DATA, {
      zip: VALID_CO_ZIP,
      miles: `${DEFAULT_RADIUS_MILES}`,
      typesOfHelp: [],
      feePreferences: [],
    });

    // Only 'close' and 'further' should be returned in results
    expect(results).toHaveLength(2);

    // and results should be sorted by distance
    expect(results[0].id).toEqual("close");
    expect(results[1].id).toEqual("further");
  });
});
