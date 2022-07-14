import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { AnalyticsAction, logEvent } from "../../../analytics";
import { LANGUAGES, Languages, SearchFilters } from "../../../types";
import { toggleItemInList } from "../../../util";
import { FilterFieldset } from "./Control";
import FilterCheckbox from "./FilterCheckbox";

type LanguageInputProps = {
  filters: SearchFilters;
  setFilters: Dispatch<SetStateAction<SearchFilters>>;
  tPrefix: string;
};

function LanguageInput({ filters, setFilters, tPrefix }: LanguageInputProps) {
  const { t } = useTranslation();

  const setLanguagesFilter = (language: Languages) => {
    logEvent(AnalyticsAction.UpdateFilter, {
      label: "languages",
      filter_type: "languages",
      filter_value: language,
    });
    setFilters({
      ...filters,
      languages: toggleItemInList(filters.languages, language),
    });
  };

  return (
    <FilterFieldset legend={t(`${tPrefix}question`)}>
      {LANGUAGES.map((option) => (
        <FilterCheckbox
          name="languages"
          value={option}
          tPrefix={`${tPrefix}answers`}
          selectedFilterValues={filters.languages}
          onChange={() => setLanguagesFilter(option)}
          key={option}
        />
      ))}
    </FilterFieldset>
  );
}

export default LanguageInput;
