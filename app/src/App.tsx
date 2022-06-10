import React, { useState } from "react";

import { LatLngLiteral } from "leaflet";

import "@trussworks/react-uswds/lib/uswds.css";
import "@trussworks/react-uswds/lib/index.css";
import {
  Button,
  Grid,
  GridContainer,
  Header,
  Title,
  TextInput,
} from "@trussworks/react-uswds";

import "./App.css";

import zipToLatLong from "./data/colorado_zip_latlong.json";

function App() {
  const [zip, setZip] = useState<string>("");
  const [center, setCenter] = useState<LatLngLiteral | null>(null);
  const [error, setError] = useState<string | null>(null);

  function doSearch(zip: string) {
    // @ts-ignore
    const center = zipToLatLong[zip]; // TODO: handle typing
    if (center) {
      setCenter(center);
      setError(null);
    } else {
      setCenter(null);
      setError("This is not a ZIP Code in Colorado");
    }
  }

  // TODO: validate zip
  return (
    <div className="App">
      <Header basic color="primary" role="banner">
        <div className="usa-nav-container">
          <div className="usa-navbar">
            <Title>
              <a href="/" title="Home" aria-label="Home">
                Colorado Care Directory Prototype
              </a>
            </Title>
          </div>
        </div>
      </Header>
      <GridContainer>
        <Grid row>
          <div className="padding-top-4">
            <h1>Find care near you</h1>
            <div className="padding-bottom-2">
              <TextInput
                id="zipcode"
                name="zipcode"
                type="text"
                placeholder="ZIP Code"
                maxLength={5}
                onChange={(evt) => setZip(evt.target.value)}
              />
            </div>
            <Button type="button" onClick={() => doSearch(zip)}>
              Search
            </Button>
          </div>
        </Grid>
        <Grid row>
          <div className="padding-top-4">
            {center && (
              <p className="text-primary">
                The center of the radius search is {center.lat}, {center.lng}
              </p>
            )}
            {error && <p className="text-error">{error}</p>}
          </div>
        </Grid>
      </GridContainer>
    </div>
  );
}

export default App;
