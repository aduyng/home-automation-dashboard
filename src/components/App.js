import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Helmet } from "react-helmet";
import EnergyPage from "../pages/EnergyPage";

export default () => {
  return (
    <div className="App">
      <CssBaseline />
      <Helmet>
        <meta charSet="utf-8" />
        <title>{process.env.REACT_APP_APPLICATION_TITLE}</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"
        />
      </Helmet>
      <EnergyPage />
    </div>
  );
};
