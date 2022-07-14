import React, { useEffect, useState, useRef } from "react";

import { Alert, Button, Grid, GridContainer } from "@trussworks/react-uswds";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Map as LeafletMap } from "leaflet";
import { Marker } from "react-leaflet";

import {
  getMatchingCare,
  getResultBounds,
  getFiltersFromSearchParams,
  MILE_DISTANCE_OPTIONS,
} from "../util";
import CARE_PROVIDER_DATA from "../data/ladders_data.json";
import {
  CareProvider,
  CareProviderSearchResult,
  SearchFilters,
  SearchResult,
} from "../types";
import Control from "../components/Search/Filters/Control";
import ResultCard from "../components/Search/ResultCard";
import ResultsList from "../components/Search/ResultsList";
import ResultsMap from "../components/Search/ResultsMap";
import MobileViewToggle from "../components/Search/MobileViewToggle";
import { markerIcon, markerActiveIcon } from "../components/Map";
import { ReactComponent as Close } from "../images/close.svg";
import ShareButton from "../components/ShareButton";
import { AnalyticsAction, logEvent, logPageView } from "../analytics";

const T_PREFIX = "pages.search.";
/**
 * The side-by-side list + map view for desktop or tablet,
 * which is visually hidden in mobile via CSS, but should still
 * be picked up by screen readers
 */
const Desktop = ({ results }: { results: CareProviderSearchResult[] }) => {
  const [selectedResultId, setSelectedResultId] = useState<string>("");
  const mapRef = useRef<LeafletMap>(null);
  const rerenderMap = () => {
    setTimeout(() => {
      mapRef.current?.fitBounds(getResultBounds(results), { animate: false });
    }, 100);
  };

  // Rerender map whenever search filters change to ensure map displays
  // filtered results correctly
  useEffect(() => {
    rerenderMap();
  }, [results]);

  return (
    <div className="display-none tablet:display-block">
      <Grid row className="border-top border-base-lighter overflow-x-hidden">
        <Grid
          tablet={{ col: 7 }}
          className="height-viewport padding-left-3"
          key="desktop-list"
        >
          <ResultsList results={results} selectedResultId={selectedResultId} />
        </Grid>
        <Grid
          tablet={{ col: 5 }}
          key="desktop-map"
          className="position-sticky top-0"
        >
          <div className="border-right border-left border-base-lighter">
            <ResultsMap bounds={getResultBounds(results)} mapRef={mapRef}>
              {results.map(
                (result) =>
                  result.latlng && (
                    <Marker
                      position={result.latlng}
                      icon={
                        selectedResultId === result.id
                          ? markerActiveIcon
                          : markerIcon
                      }
                      zIndexOffset={
                        selectedResultId === result.id ? 1000 : undefined
                      }
                      key={result.id}
                      eventHandlers={{
                        click: () => {
                          logEvent(AnalyticsAction.ClickMapMarker, {});
                          setSelectedResultId(result.id);
                          document.getElementById(result.id)?.scrollIntoView();
                        },
                      }}
                    />
                  )
              )}
            </ResultsMap>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

/**
 * The toggle-able list + map views for mobile,
 * which are visually hidden in tablet/desktop via CSS
 * and always hidden from screen readers (via aria-hidden=true)
 * to avoid duplication of results lists to screen readers
 */
const Mobile = ({ results }: { results: CareProviderSearchResult[] }) => {
  // Flag to track map vs list view
  const [isListView, setIsListView] = useState(true);

  const { t } = useTranslation();

  const mapRef = useRef<LeafletMap>(null);
  const rerenderMap = () => {
    setTimeout(() => {
      mapRef.current?.fitBounds(getResultBounds(results), { animate: false });
    }, 100);
  };

  // Rerender map whenever search filters change to ensure map displays
  // filtered results correctly
  useEffect(() => {
    rerenderMap();
  }, [results]);

  // invalidate size and rerender map when user switches to map view
  // to ensure it displays correctly despite having been `display: none`
  // https://stackoverflow.com/a/36257493
  const onShowMap = () => {
    logEvent(AnalyticsAction.ToggleResultView, { label: "map" });
    setIsListView(false);
    mapRef.current?.invalidateSize();
    rerenderMap();
  };

  const onShowList = () => {
    logEvent(AnalyticsAction.ToggleResultView, { label: "list" });
    setIsListView(true);
  };

  const [selectedResult, setSelectedResult] =
    useState<CareProviderSearchResult>();
  return (
    <div
      className="tablet:display-none border-top border-base-lighter padding-x-2 tablet:padding-x-0"
      aria-hidden
    >
      <MobileViewToggle
        isListView={isListView}
        onShowMap={onShowMap}
        onShowList={onShowList}
      />
      <div className={isListView ? "" : "display-none"} key="mobile-list">
        <ResultsList results={results} isMobile />
      </div>
      <div className={isListView ? "display-none" : ""} key="mobile-map">
        <div className="border border-base-lighter">
          <ResultsMap
            bounds={getResultBounds(results)}
            mapRef={mapRef}
            isMobile
            onClick={() => {
              // Clear selected result card when map is
              // clicked anywhere that is not a marker
              setSelectedResult(undefined);
            }}
          >
            {results.map(
              (result) =>
                result.latlng && (
                  <Marker
                    title={result.id}
                    position={result.latlng}
                    icon={
                      selectedResult?.id === result.id
                        ? markerActiveIcon
                        : markerIcon
                    }
                    key={result.id}
                    eventHandlers={{
                      click: () => {
                        setSelectedResult(
                          results.find((r) => r.id === result.id)
                        );
                      },
                    }}
                  />
                )
            )}
          </ResultsMap>
        </div>
        {selectedResult ? (
          <div className="bg-white border border-base-lighter radius-lg padding-2 margin-bottom-1 position-relative top-neg-50px z-top">
            <Grid className="flex-justify-end" row>
              <Grid col="auto">
                <Button
                  type="button"
                  unstyled
                  className="flex-align-center"
                  onClick={() => setSelectedResult(undefined)}
                >
                  {t("common.close")} <Close />
                </Button>
              </Grid>
            </Grid>
            <ResultCard data={selectedResult} />
          </div>
        ) : (
          <Alert
            type="info"
            slim
            headingLevel=""
            className="radius-lg margin-y-2"
          >
            {t(`${T_PREFIX}mapHelper`)}
          </Alert>
        )}
      </div>
    </div>
  );
};

function Search() {
  const { t } = useTranslation();
  // Search filters as URL search params
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilters = getFiltersFromSearchParams(searchParams);

  // TODO: do we need this, or can we just use searchParams to track filter state?
  const [searchFilters, setSearchFilters] =
    useState<SearchFilters>(initialFilters);
  // Filtered set of CareProviders OR error string
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  const navigate = useNavigate();

  const performSearch = (filters: SearchFilters) => {
    const result = getMatchingCare(
      CARE_PROVIDER_DATA as CareProvider[],
      filters
    );
    setSearchResult(result);
  };

  const isCurrentlyAtWidestRadius =
    searchFilters.miles ===
    MILE_DISTANCE_OPTIONS[MILE_DISTANCE_OPTIONS.length - 1];

  useEffect(() => {
    // zip is the only required filter - redirect to homepage if it doesn't exist
    if (!initialFilters.zip) {
      navigate("/", {
        replace: true,
      });
    } else {
      performSearch(searchFilters);
      logPageView();
    }
  }, []);

  return (
    <div className="Search">
      {searchResult && (
        <div>
          <div className="margin-y-2 tablet:padding-x-6 padding-x-2">
            <Grid
              row
              className="flex-justify flex-align-center margin-bottom-2"
            >
              <h1 className="margin-y-0">
                {t(`${T_PREFIX}resultCount`, {
                  count: searchResult.results.length,
                  zip: searchFilters.zip,
                })}
              </h1>
              <ShareButton text={t(`${T_PREFIX}share`)} />
            </Grid>
            <Control
              currentFilters={searchFilters}
              onApplyFilters={(filters) => {
                setSearchFilters(filters);
                performSearch(filters);
                setSearchParams(filters);
              }}
            />
          </div>
          <div>
            {searchResult.results.length ? (
              <>
                <Desktop results={searchResult.results} />
                <Mobile results={searchResult.results} />
              </>
            ) : (
              <p>
                {isCurrentlyAtWidestRadius
                  ? t(`${T_PREFIX}noResultsGeneric`)
                  : t(`${T_PREFIX}noResultsExpandRadius`, {
                      miles: searchFilters.miles,
                    })}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;
