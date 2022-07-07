import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { FeePreference, SearchFilters } from "../../../types";
import { toggleItemInList } from "../../../util";
import { FilterFieldset } from "./Control";
import FilterCheckbox from "./FilterCheckbox";

type FeesPreferenceInputProps = {
  filters: SearchFilters;
  setFilters: Dispatch<SetStateAction<SearchFilters>>;
  tPrefix: string;
};

function FeesPreferenceInput({
  filters,
  setFilters,
  tPrefix,
}: FeesPreferenceInputProps) {
  const { t } = useTranslation();

  const setFeePreferenceFilter = (feePreference: FeePreference) => {
    setFilters({
      ...filters,
      feePreferences: toggleItemInList(filters.feePreferences, feePreference),
    });
  };

  const options = [
    "PrivateInsurance",
    "Medicaid",
    "SlidingFeeScale",
  ] as FeePreference[];

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

export default FeesPreferenceInput;
