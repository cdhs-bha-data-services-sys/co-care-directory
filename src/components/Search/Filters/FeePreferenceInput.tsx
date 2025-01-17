import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { AnalyticsAction, logEvent } from "../../../analytics";
import { FeePreference, SearchFilters } from "../../../types";
import { toggleItemInList } from "../../../util";
import { FilterFieldset } from "./Control";
import FilterCheckbox from "./FilterCheckbox";

type FeePreferenceInputProps = {
  options: FeePreference[];
  filters: SearchFilters;
  setFilters: Dispatch<SetStateAction<SearchFilters>>;
  tPrefix: string;
};

function FeePreferenceInput({
  options,
  filters,
  setFilters,
  tPrefix,
}: FeePreferenceInputProps) {
  const { t } = useTranslation();

  const setFeePreferenceFilter = (feePreference: FeePreference) => {
    logEvent(AnalyticsAction.UpdateFilter, {
      label: "payment options",
      filter_type: "payment options",
      filter_value: feePreference,
    });
    setFilters({
      ...filters,
      feePreferences: toggleItemInList(filters.feePreferences, feePreference),
    });
  };

  return (
    <FilterFieldset legend={t(`${tPrefix}question`)}>
      {options.map((option) => (
        <FilterCheckbox
          name="payment options"
          value={option}
          tPrefix={`${tPrefix}answers`}
          selectedFilterValues={filters.feePreferences}
          onChange={() => setFeePreferenceFilter(option)}
          key={option}
        />
      ))}
    </FilterFieldset>
  );
}

export default FeePreferenceInput;
