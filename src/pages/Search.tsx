import React, { useEffect, useState, useRef } from "react";

import { Alert, Button, Grid, GridContainer } from "@trussworks/react-uswds";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { LatLngTuple, Map as LeafletMap } from "leaflet";
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

/**
 * The side-by-side list + map view for desktop or tablet,
 * which is visually hidden in mobile via CSS, but should still
 * be picked up by screen readers
 */
const Desktop = ({ results }: { results: CareProviderSearchResult[] }) => {
  const [selectedResultId, setSelectedResultId] = useState<string>("");
  return (
    <div className="display-none tablet:display-block">
      <Grid row className="border-top border-base-lighter">
        <Grid
          tablet={{ col: 5 }}
          className="height-viewport overflow-x-hidden"
          key="desktop-list"
        >
          <ResultsList results={results} selectedResultId={selectedResultId} />
        </Grid>
        <Grid tablet={{ col: 7 }} key="desktop-map">
          <div className="border-right border-left border-base-lighter">
            <ResultsMap bounds={getResultBounds(results)}>
              {results
                .filter((result) => !!result.latlng)
                .map((result) => (
                  <Marker
                    position={result.latlng as LatLngTuple}
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
                        setSelectedResultId(result.id);
                        document.getElementById(result.id)?.scrollIntoView();
                      },
                    }}
                  />
                ))}
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

  // Leaflet map must be manually re-rendered as a workaround
  // to deal with initial hidden state when map is created
  // OR could just render map view first to avoid this special map manipulation
  const mapRef = useRef<LeafletMap>(null);
  const onShowMap = () => {
    setIsListView(false);
    setTimeout(() => {
      mapRef.current?.invalidateSize();
      mapRef.current?.fitBounds(getResultBounds(results));
    }, 100);
  };

  const [selectedResult, setSelectedResult] =
    useState<CareProviderSearchResult>();
  return (
    <div className="tablet:display-none" aria-hidden>
      <MobileViewToggle
        isListView={isListView}
        onShowMap={onShowMap}
        onShowList={() => setIsListView(true)}
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
            {results
              .filter((result) => !!result.latlng)
              .map((result) => (
                <Marker
                  title={result.id}
                  position={result.latlng as LatLngTuple}
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
              ))}
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
            <ResultCard data={selectedResult}>
              <Link className="usa-button" to={`/result/${selectedResult.id}`}>
                {t("pages.search.fullDetailButton")}
              </Link>
            </ResultCard>
          </div>
        ) : (
          <Alert
            type="info"
            slim
            headingLevel=""
            className="radius-lg margin-y-2"
          >
            {t("pages.search.mapHelper")}
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
    }
  }, []);

  return (
    <div className="Search">
      {searchResult && (
        <GridContainer>
          <div className="border-bottom border-base-lighter">
            <h1 className="margin-y-2">
              {t("pages.search.heading")} {searchFilters.zip}
            </h1>
            <div className="margin-y-2">
              <Control
                currentFilters={searchFilters}
                onApplyFilters={(filters) => {
                  setSearchFilters(filters);
                  performSearch(filters);
                  setSearchParams(filters);
                }}
              />
            </div>
          </div>
          <div>
            {searchResult.error ? (
              <p className="text-error">{searchResult.error}</p>
            ) : (
              <>
                <h2 className="margin-y-2">
                  {t("pages.search.resultCount", {
                    count: searchResult.results.length,
                  })}
                </h2>
                {searchResult.results.length ? (
                  <>
                    <Desktop results={searchResult.results} />
                    <Mobile results={searchResult.results} />
                  </>
                ) : (
                  <p>
                    {isCurrentlyAtWidestRadius
                      ? t("pages.search.noResultsGeneric")
                      : t("pages.search.noResultsExpandRadius", {
                          miles: searchFilters.miles,
                        })}
                  </p>
                )}
              </>
            )}
          </div>
        </GridContainer>
      )}
    </div>
  );
}

export default Search;
