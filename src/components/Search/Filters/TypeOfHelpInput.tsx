import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { AnalyticsAction, logEvent } from "../../../analytics";
import { SearchFilters, TypeOfHelp } from "../../../types";
import { toggleItemInList } from "../../../util";
import { FilterFieldset } from "./Control";
import FilterCheckbox from "./FilterCheckbox";

type TypeOfHelpInputProps = {
  options: TypeOfHelp[];
  filters: SearchFilters;
  setFilters: Dispatch<SetStateAction<SearchFilters>>;
  tPrefix: string;
};

function TypeOfHelpInput({
  options,
  filters,
  setFilters,
  tPrefix,
}: TypeOfHelpInputProps) {
  const { t } = useTranslation();

  const setTypeOfHelpFilter = (typeOfHelp: TypeOfHelp) => {
    logEvent(AnalyticsAction.UpdateFilter, {
      label: "type of help",
      filter_type: "type of help",
      filter_value: typeOfHelp,
    });
    setFilters({
      ...filters,
      typesOfHelp: toggleItemInList(filters.typesOfHelp, typeOfHelp),
    });
  };

  return (
    <FilterFieldset legend={t(`${tPrefix}question`)}>
      {options.map((option) => (
        <FilterCheckbox
          name="type of help"
          value={option}
          tPrefix={`${tPrefix}answers`}
          selectedFilterValues={filters.typesOfHelp}
          onChange={() => setTypeOfHelpFilter(option)}
          key={option}
        />
      ))}
      {filters.typesOfHelp.includes(TypeOfHelp.SuicidalIdeation) && (
        <div className="margin-top-3 radius-lg bg-teal padding-y-1 padding-x-3">
          <p>{t("common.suicidalIdeationPopup.crisisServices")}</p>
          <p>{t("common.suicidalIdeationPopup.emergency")}</p>
        </div>
      )}
    </FilterFieldset>
  );
}

export default TypeOfHelpInput;
