import { Label, TextInput } from "@trussworks/react-uswds";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchFilters, ZipSearchMetadata } from "../../types";
import { getZipSearchMetadata } from "../../util";

type ZipInputProps = {
  filters: SearchFilters;
  setFilters: Dispatch<SetStateAction<SearchFilters>>;
  setIsValidZip: Dispatch<SetStateAction<boolean>>;
  onBlur?: () => void;
};

function ZipInput({
  filters,
  setFilters,
  setIsValidZip,
  onBlur,
}: ZipInputProps) {
  const { t } = useTranslation();
  const [zip, setZip] = useState<string>(filters.zip);

  useEffect(() => {
    const zipSearchMetadata = getZipSearchMetadata(zip);
    if (zipSearchMetadata.isValidZip) {
      setFilters({
        ...filters,
        zip,
        // set default radius if miles has not yet been specified
        miles: filters.miles || zipSearchMetadata.defaultRadiusMiles.toString(),
      });
      setIsValidZip(true);
    } else {
      setIsValidZip(false);
    }
  }, [zip]);

  return (
    <div className="width-full">
      <Label htmlFor="zip" className="margin-bottom-1">
        {t(`common.zipCode`)}
      </Label>
      <TextInput
        className="margin-top-0"
        id="zip"
        name="zip"
        type="text"
        maxLength={5}
        value={zip}
        onChange={(evt) => {
          const cleanZipVal = evt.target.value.replace(/[^0-9]+/g, "");
          setZip(cleanZipVal);
        }}
        onBlur={onBlur}
      />
    </div>
  );
}

export default ZipInput;
