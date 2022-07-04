import { TFunction, useTranslation } from "react-i18next";
import { DailyHours, WeeklyHours } from "../../types";

const T_PREFIX = "components.resultDetail.";

const formatDailyHours = (hours: DailyHours, t: TFunction) => {
  return hours.open ? `${hours.start} - ${hours.end}` : t(`${T_PREFIX}closed`);
};

function Hours({ hours }: { hours: WeeklyHours }) {
  const { t } = useTranslation();
  if (!hours) {
    return (
      <div className="margin-bottom-1">{t(`${T_PREFIX}contactForInfo`)}</div>
    );
  }
  return (
    <>
      <div className="margin-bottom-1">
        {t(`${T_PREFIX}monday`)} {": "} {formatDailyHours(hours.monday, t)}
      </div>
      <div className="margin-bottom-1">
        {t(`${T_PREFIX}tuesday`)}: {formatDailyHours(hours.tuesday, t)}
      </div>
      <div className="margin-bottom-1">
        {t(`${T_PREFIX}wednesday`)}: {formatDailyHours(hours.wednesday, t)}
      </div>
      <div className="margin-bottom-1">
        {t(`${T_PREFIX}thursday`)}: {formatDailyHours(hours.thursday, t)}
      </div>
      <div className="margin-bottom-1">
        {t(`${T_PREFIX}friday`)}: {formatDailyHours(hours.friday, t)}
      </div>
      <div className="margin-bottom-1">
        {t(`${T_PREFIX}saturday`)}: {formatDailyHours(hours.saturday, t)}
      </div>
      <div className="margin-bottom-1">
        {t(`${T_PREFIX}sunday`)}: {formatDailyHours(hours.sunday, t)}
      </div>
    </>
  );
}

export default Hours;
