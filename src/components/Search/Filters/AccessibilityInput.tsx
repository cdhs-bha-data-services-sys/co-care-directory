import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import {
  AccessibilityOptions,
  ACCESSIBILITY_OPTIONS,
  SearchFilters,
} from "../../../types";
import { toggleItemInList } from "../../../util";
import { FilterFieldset } from "./Control";
import FilterCheckbox from "./FilterCheckbox";

type AccessibilityInputProps = {
  filters: SearchFilters;
  setFilters: Dispatch<SetStateAction<SearchFilters>>;
  tPrefix: string;
};

function AccessibilityInput({
  filters,
  setFilters,
  tPrefix,
}: AccessibilityInputProps) {
  const { t } = useTranslation();

  const setAccessibilityFilter = (
    accessibilityOption: AccessibilityOptions
  ) => {
    setFilters({
      ...filters,
      accessibility: toggleItemInList(
        filters.accessibility,
        accessibilityOption
      ),
    });
  };

  return (
    <FilterFieldset legend={t(`${tPrefix}question`)}>
      {ACCESSIBILITY_OPTIONS.map((option) => (
        <FilterCheckbox
          name="accessibility"
          value={option}
          tPrefix={`${tPrefix}answers`}
          selectedFilterValues={filters.accessibility}
          onChange={() => setAccessibilityFilter(option)}
          key={option}
        />
      ))}
    </FilterFieldset>
  );
}

export default AccessibilityInput;
