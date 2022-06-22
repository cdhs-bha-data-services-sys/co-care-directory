import 'leaflet/dist/leaflet.css';

import markerIconPng from "leaflet/dist/images/marker-icon.png"
import {Icon} from 'leaflet'

import { MapContainer, MapContainerProps, TileLayer, TileLayerProps } from "react-leaflet";
import { CSSProperties, PropsWithChildren } from 'react';

// From https://stackoverflow.com/a/65549235
const markerIcon = new Icon({iconUrl: markerIconPng, iconSize: [25, 41]});

type MapProps = {
  mapContainerProps?: Exclude<MapContainerProps, 'style'>;
  mapContainerStyles?: CSSProperties;
  tileLayerProps?: Partial<TileLayerProps>;
  
}

function Map({ mapContainerProps, mapContainerStyles, tileLayerProps, children } : PropsWithChildren<MapProps>) {

  return (
    <MapContainer style={{ height: '500px', borderRadius: '10px', ...mapContainerStyles }} scrollWheelZoom={false} zoom={7} {...mapContainerProps}>
    <TileLayer url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" subdomains={['mt0', 'mt1', 'mt2', 'mt3']} {...tileLayerProps} />
      {children}
    </MapContainer>
  )
}

export default Map;
export { markerIcon }