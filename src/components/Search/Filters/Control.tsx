import { Button, Fieldset, Grid } from "@trussworks/react-uswds";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { SearchFilters, TypeOfHelp } from "../../../types";
import ControlDropdown from "./ControlDropdown";
import FeePreferenceInput from "./FeePreferenceInput";
import HoursInput from "./HoursInput";
import LanguageInput from "./LanguageInput";
import TypeOfHelpInput from "./TypeOfHelpInput";
import AccessibilityInput from "./AccessibilityInput";
import DistanceInput from "./DistanceInput";
import ControlToggles from "./ControlToggles";

export const FilterFieldset = styled(Fieldset)`
  legend {
    font-weight: bold;
  }
`;

type ControlProps = {
  currentFilters: SearchFilters;
  onApplyFilters: (filters: SearchFilters) => void;
};

function Control({ currentFilters, onApplyFilters }: ControlProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<SearchFilters>(currentFilters);

  // Control doesn't actually need to maintain additional state var
  // for filters but refactoring right now is out of scope.
  // To maintain desired functionality where filters are not
  // "applied" until button press, we must use url params as
  // source of truth between displayed results and controls.
  // Thus, we must update these filters when they change in the
  // url
  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  return (
    <>
      <Grid row className="margin-bottom-2">
        <ControlDropdown
          title={t("components.search.filters.typeOfHelp.question")}
          hasSelection={!!filters.typesOfHelp?.length}
          clearAll={() => setFilters({ ...filters, typesOfHelp: [] })}
          applyFilters={() => onApplyFilters(filters)}
        >
          <TypeOfHelpInput
            hideLegend
            options={[
              TypeOfHelp.MentalHealth,
              TypeOfHelp.CourtMandatedTreatment,
              TypeOfHelp.SubstanceUse,
            ]}
            filters={filters}
            setFilters={setFilters}
            tPrefix="components.search.filters.typeOfHelp."
          />
        </ControlDropdown>
        <ControlDropdown
          title={t("components.search.filters.feePreference.question")}
          hasSelection={!!filters.feePreferences?.length}
          clearAll={() => setFilters({ ...filters, feePreferences: [] })}
          applyFilters={() => onApplyFilters(filters)}
        >
          <FeePreferenceInput
            hideLegend
            options={["PrivateInsurance", "Medicaid", "SlidingFeeScale"]}
            filters={filters}
            setFilters={setFilters}
            tPrefix="components.search.filters.feePreference."
          />
        </ControlDropdown>
        <ControlDropdown
          title={t("components.search.filters.hours.question")}
          hasSelection={!!filters.hours?.length}
          clearAll={() => setFilters({ ...filters, hours: [] })}
          applyFilters={() => onApplyFilters(filters)}
        >
          <HoursInput
            hideLegend
            filters={filters}
            setFilters={setFilters}
            tPrefix="components.search.filters.hours."
          />
        </ControlDropdown>
        <ControlDropdown
          title={t("components.search.filters.accessibility.question")}
          hasSelection={!!filters.accessibility?.length}
          clearAll={() => setFilters({ ...filters, accessibility: [] })}
          applyFilters={() => onApplyFilters(filters)}
        >
          <AccessibilityInput
            hideLegend
            filters={filters}
            setFilters={setFilters}
            tPrefix="components.search.filters.accessibility."
          />
        </ControlDropdown>
        <ControlDropdown
          title={t("components.search.filters.distance.distance")}
          hasSelection={true}
          applyFilters={() => onApplyFilters(filters)}
        >
          <DistanceInput
            hideLegend
            filters={filters}
            setFilters={setFilters}
            tPrefix="components.search.filters.distance."
          />
        </ControlDropdown>
      </Grid>
      <ControlToggles applyFilters={onApplyFilters} />
    </>
  );
}

export default Control;
