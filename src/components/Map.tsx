import "leaflet/dist/leaflet.css";

import { Icon, LeafletEventHandlerFnMap, Map as LeafletMap } from "leaflet";

import {
  MapContainer,
  MapContainerProps,
  TileLayer,
  TileLayerProps,
  useMapEvents,
} from "react-leaflet";
import { CSSProperties, PropsWithChildren, Ref } from "react";

import mapMarker from "../images/map-marker.svg";
import mapMarkerActive from "../images/map-marker-active.svg";

const markerIcon = new Icon({ iconUrl: mapMarker, iconSize: [32, 32] });
const markerActiveIcon = new Icon({
  iconUrl: mapMarkerActive,
  iconSize: [32, 32],
});
// From https://stackoverflow.com/a/65549235

function MapEvents({
  eventHandlers,
}: {
  eventHandlers: LeafletEventHandlerFnMap;
}) {
  useMapEvents(eventHandlers);
  return null;
}

type MapProps = {
  mapContainerProps?: Exclude<MapContainerProps, "style">;
  mapContainerStyles?: CSSProperties;
  tileLayerProps?: Partial<TileLayerProps>;
  mapRef?: Ref<LeafletMap>; // to enable external access of underlying Map instance
  eventHandlers?: LeafletEventHandlerFnMap;
};

function Map({
  mapContainerProps,
  mapContainerStyles,
  tileLayerProps,
  mapRef,
  eventHandlers = {},
  children,
}: PropsWithChildren<MapProps>) {
  return (
    <MapContainer
      style={{ height: "500px", ...mapContainerStyles }}
      scrollWheelZoom={false}
      {...mapContainerProps}
      ref={mapRef}
    >
      <MapEvents eventHandlers={eventHandlers} />
      <TileLayer
        url="https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png"
        attribution={`Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.`}
        {...tileLayerProps}
      />
      {children}
    </MapContainer>
  );
}

export default Map;
export { markerIcon, markerActiveIcon };
