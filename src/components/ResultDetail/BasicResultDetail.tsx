import { Link } from "@trussworks/react-uswds";
import { useTranslation } from "react-i18next";

import { ReactComponent as Telephone } from "../../images/phone.svg";
import { ReactComponent as Website } from "../../images/website.svg";
import { ReactComponent as Location } from "../../images/location.svg";
import { ReactComponent as DollarSign } from "../../images/dollar-sign.svg";
import { ReactComponent as Clock } from "../../images/clock.svg";

import ResultDatum from "./ResultDatum";
import Hours from "./Hours";

import { CareProvider } from "../../types";
import { anyAreTrue } from "../../util";
import CommaSeparatedList from "../CommaSeparatedList";
import WebsiteLink from "./WebsiteLink";
import DirectionsLink from "./DirectionsLink";

type BasicResultDetailProps = {
  headingLevel: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  result: CareProvider;
};

function BasicResultDetail({ headingLevel, result }: BasicResultDetailProps) {
  const { t } = useTranslation();
  const T_PREFIX = "components.resultDetail.";
  const Heading = headingLevel;

  return (
    <>
      {result.phone && (
        <ResultDatum Icon={Telephone} key="telephone">
          <Heading className="usa-sr-only">
            {t(`${T_PREFIX}telephoneNumber`)}
          </Heading>
          <Link variant="external" href={`tel:${result.phone}`}>
            {result.phone}
          </Link>
        </ResultDatum>
      )}
      {result.website && (
        <ResultDatum Icon={Website} key="website">
          <Heading className="usa-sr-only">{t(`${T_PREFIX}website`)}</Heading>
          <WebsiteLink url={result.website} />
        </ResultDatum>
      )}
      {!!result.address?.length && (
        <ResultDatum Icon={Location} key="address">
          <Heading className="usa-sr-only">{t(`${T_PREFIX}address`)}</Heading>
          {result.address.map((addr, idx) => (
            <div key={idx} className="margin-bottom-05">
              {addr}
            </div>
          ))}
          <DirectionsLink careProvider={result} />
        </ResultDatum>
      )}

      <ResultDatum Icon={DollarSign} key="fees">
        <Heading className="font-body-sm margin-top-0 margin-bottom-05">
          {t(`${T_PREFIX}fees`)}
        </Heading>
        <div className="margin-bottom-05">
          {!!anyAreTrue(result.fees) ? (
            <>
              <div className="margin-bottom-05">
                <CommaSeparatedList
                  boolMap={result.fees}
                  translationPrefix={`${T_PREFIX}_fees.`}
                />
              </div>
              {/* <Button type="button" unstyled className="font-ui-xs">
                What do these mean?
              </Button> */}
            </>
          ) : (
            t(`${T_PREFIX}contactForInfo`)
          )}
        </div>
      </ResultDatum>

      <ResultDatum Icon={Clock} key="hours">
        <Heading className="font-body-sm margin-top-0 margin-bottom-05">
          {t(`${T_PREFIX}hours`)}
        </Heading>
        <Hours hours={result.hours} />
      </ResultDatum>
    </>
  );
}

export default BasicResultDetail;
