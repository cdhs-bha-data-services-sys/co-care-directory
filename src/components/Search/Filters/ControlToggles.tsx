import { Button, Grid } from "@trussworks/react-uswds";
import { useSearchParams } from "react-router-dom";
import { SearchFilters } from "../../../types";
import { getFiltersFromSearchParams, toggleItemInList } from "../../../util";
import { ReactComponent as Close } from "../../../images/close.svg";
import { useTranslation } from "react-i18next";

type ControlToggleProps = {
  name: string;
  onClick: () => void;
};
function ControlToggle({ name, onClick }: ControlToggleProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      unstyled
      className="margin-left-2 text-no-underline text-dark-blue width-auto"
    >
      {name} <Close height={10} className="margin-left-05" />
    </Button>
  );
}

type ControlTogglesProps = {
  applyFilters: (filters: SearchFilters) => void;
};

function ControlToggles({ applyFilters }: ControlTogglesProps) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  let filters = getFiltersFromSearchParams(searchParams);

  // Check if any optional (i.e. besides distance & location) filters are applied
  const optionalFiltersApplied =
    !!filters.accessibility?.length ||
    !!filters.feePreferences?.length ||
    !!filters.hours?.length ||
    !!filters.typesOfHelp.length;

  if (!optionalFiltersApplied) return <></>;

  return (
    <Grid row className="margin-bottom-2 flex-align-baseline">
      <span className="text-bold text-dark-blue">
        {t("components.search.filteredBy")}:
      </span>
      {filters.accessibility.map((aFilter) => (
        <ControlToggle
          name={t(`components.search.filters.accessibility.answers.${aFilter}`)}
          onClick={() =>
            applyFilters({
              ...filters,
              accessibility: toggleItemInList(filters.accessibility, aFilter),
            })
          }
        />
      ))}
      {filters.feePreferences.map((fFilter) => (
        <ControlToggle
          name={t(`components.search.filters.feePreference.answers.${fFilter}`)}
          onClick={() =>
            applyFilters({
              ...filters,
              feePreferences: toggleItemInList(filters.feePreferences, fFilter),
            })
          }
        />
      ))}
      {filters.hours.map((hFilter) => (
        <ControlToggle
          name={t(`common.daysOfWeek.${hFilter}`)}
          onClick={() =>
            applyFilters({
              ...filters,
              hours: toggleItemInList(filters.hours, hFilter),
            })
          }
        />
      ))}
      {filters.typesOfHelp.map((tFilter) => (
        <ControlToggle
          name={t(`components.search.filters.typeOfHelp.answers.${tFilter}`)}
          onClick={() =>
            applyFilters({
              ...filters,
              typesOfHelp: toggleItemInList(filters.typesOfHelp, tFilter),
            })
          }
        />
      ))}
      <Button
        unstyled
        className="margin-left-2 width-auto"
        type="button"
        onClick={() =>
          applyFilters({
            ...filters,
            accessibility: [],
            feePreferences: [],
            hours: [],
            typesOfHelp: [],
          })
        }
      >
        {t("components.search.clearFiltersButton")}
      </Button>
    </Grid>
  );
}

export default ControlToggles;
