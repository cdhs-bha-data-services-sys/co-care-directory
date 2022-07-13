import { Button, Fieldset, Form } from "@trussworks/react-uswds";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { AnalyticsAction, logEvent } from "../../../analytics";
import { SearchFilters, TypeOfHelp } from "../../../types";
import AccessibilityInput from "./AccessibilityInput";
import DistanceInput from "./DistanceInput";
import FeePreferenceInput from "./FeePreferenceInput";
import TypeOfHelpInput from "./TypeOfHelpInput";

export const FilterFieldset = styled(Fieldset)`
  legend {
    font-weight: bold;
  }
`;

const countOptionalFiltersSelected = (filters: SearchFilters): number => {
  let count = 0;
  if (filters.typesOfHelp.length) {
    count += 1;
  }
  if (filters.feePreferences.length) {
    count += 1;
  }
  return count;
};

const clearOptionalFilters = (filters: SearchFilters): SearchFilters => {
  return {
    ...filters,
    typesOfHelp: [],
    feePreferences: [],
  };
};

const T_PREFIX = "components.search.";
function SearchFiltersControl({
  currentFilters,
  onApplyFilters,
}: {
  currentFilters: SearchFilters;
  onApplyFilters: (filters: SearchFilters) => void;
}) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<SearchFilters>(currentFilters);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const countSelected = countOptionalFiltersSelected(currentFilters);

  // if filter is closed, reset any filters that haven't been applied
  useEffect(() => {
    if (!isExpanded) {
      setFilters(currentFilters);
    }
  }, [isExpanded]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        logEvent(AnalyticsAction.ApplyFilter, { label: "Apply button" });
        onApplyFilters(filters);
        setIsExpanded(false);
      }}
    >
      <Button
        type="button"
        className="radius-pill"
        onClick={() => setIsExpanded(!isExpanded)}
        outline={countSelected === 0}
        base={countSelected !== 0}
      >
        {t(`${T_PREFIX}toggleFiltersButton`, {
          count: countSelected,
        })}
      </Button>
      <div className={isExpanded ? "display-block" : "display-none"}>
        <div className="margin-y-2">
          {countSelected > 0 && (
            <Button
              type="button"
              onClick={() => {
                logEvent(AnalyticsAction.ApplyFilter, {
                  label: "Clear filters button",
                });
                const cleared = clearOptionalFilters(filters);
                setFilters(cleared);
                onApplyFilters(cleared);
              }}
              unstyled
            >
              {t(`${T_PREFIX}clearFiltersButton`)}
            </Button>
          )}
        </div>
        <div className="margin-y-3">
          <DistanceInput
            filters={filters}
            setFilters={setFilters}
            tPrefix={`${T_PREFIX}filters.distance.`}
          />
        </div>
        <div className="margin-y-3">
          <TypeOfHelpInput
            options={[
              TypeOfHelp.SubstanceUse,
              TypeOfHelp.CourtMandatedTreatment,
              TypeOfHelp.MentalHealth,
            ]}
            filters={filters}
            setFilters={setFilters}
            tPrefix={`${T_PREFIX}filters.typeOfHelp.`}
          />
        </div>
        <div className="margin-y-3">
          <FeePreferenceInput
            options={["PrivateInsurance", "Medicaid", "SlidingFeeScale"]}
            filters={filters}
            setFilters={setFilters}
            tPrefix={`${T_PREFIX}filters.feePreference.`}
          />
        </div>
        <div className="margin-y-3">
          <AccessibilityInput
            filters={filters}
            setFilters={setFilters}
            tPrefix={`${T_PREFIX}filters.accessibility.`}
          />
        </div>
        <Button type="submit" className="usa-button">
          {t(`${T_PREFIX}viewResultsButton`)}
        </Button>
        <div className="padding-top-2">
          <Button type="button" onClick={() => setIsExpanded(false)} unstyled>
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default SearchFiltersControl;
