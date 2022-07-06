import { Button, Card, CardBody, ErrorMessage } from "@trussworks/react-uswds";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createSearchParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { SearchFilters } from "../../types";
import ZipInput from "./ZipInput";

const ZipButton = styled(Button)`
  max-width: 6rem;
  max-height: 2.5rem;
  margin-right: 0;
`;

function ZipCard() {
  const [filters, setFilters] = useState<SearchFilters>({
    zip: "",
    miles: "",
    typesOfHelp: [],
    feePreferences: [],
  });

  const { t } = useTranslation();
  const navigate = useNavigate();
  const T_PREFIX = "components.home.";
  const [isValidZip, setIsValidZip] = useState<boolean>(false);
  // don't show validation errors until clicking search or clicking out of input
  const [showValidation, setShowValidation] = useState<boolean>(false);

  return (
    <Card
      className="margin-bottom-0"
      containerProps={{ className: "border-0 margin-bottom-0 padding-right-5" }}
      gridLayout={{ col: 12, tablet: { col: 7 } }}
    >
      <CardBody>
        <p className="text-bold font-body-lg margin-bottom-05">
          {t(`${T_PREFIX}zipPrompt`)}
        </p>
        <form
          onSubmit={(evt) => {
            evt.preventDefault();
            if (isValidZip) {
              navigate({
                pathname: "/search",
                search: createSearchParams(filters).toString(),
              });
            } else {
              setShowValidation(true);
            }
          }}
        >
          <div className="display-flex flex-align-end">
            <ZipInput
              filters={filters}
              setFilters={setFilters}
              setIsValidZip={setIsValidZip}
              onBlur={() => setShowValidation(true)}
            />
            <ZipButton type="submit" className="usa-button margin-left-1">
              {t(`${T_PREFIX}searchButton`)}
            </ZipButton>
          </div>
          {showValidation && !isValidZip && (
            <ErrorMessage>{t("common.zipCodeError")}</ErrorMessage>
          )}
        </form>
      </CardBody>
    </Card>
  );
}

export default ZipCard;
