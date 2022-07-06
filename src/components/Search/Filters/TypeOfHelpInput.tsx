import { Fragment } from "react";
import { Checkbox } from "@trussworks/react-uswds";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { SearchFilters, TypeOfHelp } from "../../../types";
import { toggleItemInList } from "../../../util";
import { FilterFieldset } from "./Control";

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
    setFilters({
      ...filters,
      typesOfHelp: toggleItemInList(filters.typesOfHelp, typeOfHelp),
    });
  };

  // TODO: consolidate getCheckbox logic? (see FeesPreferenceInput)
  const getCheckbox = (typeOfHelp: TypeOfHelp) => (
    <Fragment key={typeOfHelp}>
      <Checkbox
        id={typeOfHelp}
        name="type of help"
        label={t(`${tPrefix}answers.${typeOfHelp}`)}
        checked={filters.typesOfHelp.includes(typeOfHelp)}
        onChange={() => setTypeOfHelpFilter(typeOfHelp)}
        value={typeOfHelp}
      />
      {typeOfHelp === TypeOfHelp.SuicidalIdeation &&
        filters.typesOfHelp.includes(typeOfHelp) && (
          <div className="margin-1 radius-lg bg-teal padding-y-1 padding-x-3">
            <p>{t("common.suicidalIdeationPopup.crisisServices")}</p>
            <p>{t("common.suicidalIdeationPopup.emergency")}</p>
          </div>
        )}
    </Fragment>
  );

  return (
    <FilterFieldset legend={t(`${tPrefix}question`)}>
      {options.map((opt) => getCheckbox(opt))}
    </FilterFieldset>
  );
}

export default TypeOfHelpInput;
