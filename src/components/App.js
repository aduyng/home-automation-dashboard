import React, { useContext, useEffect, useState } from "react";
import { filter, sortBy } from "lodash";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Helmet } from "react-helmet";
import { createMuiTheme } from "@material-ui/core/styles";
import ApplicationContext from "../contexts/ApplicationContext";
import firebase from "../libs/firebase/firebase";
import Page from "./Page";
import { ThemeProvider } from "@material-ui/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import * as Widgets from "../widgets/index";

const theme = createMuiTheme({
  palette: {
    type: "dark"
  },
  background: "black"
});

function renderMainContent({ pages }) {
  const activePages = filter(pages, page => page.disabled !== true);
  const sortedPages = sortBy(activePages, "priority");
  return sortedPages.map(page => {
    return (
      <Page key={page.name}>
        <Grid container spacing={1}>
          {page.widgets.map(widget => {
            const key = `${page.name}-${widget.name}`;
            const WidgetClass = Widgets[widget.name];
            if (!WidgetClass) {
              return null;
            }
            return (
              <Grid key={key} item {...widget.sizes}>
                <WidgetClass />
              </Grid>
            );
          })}
        </Grid>
      </Page>
    );
  });
}

export default ({ manifest }) => {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchApplicationConfiguration() {
      setIsLoading(true);
      setConfig({ manifest });
      const querySnapshot = await firebase
        .database()
        .ref(process.env.REACT_APP_FIREBASE_DASHBOARD_CONFIGURATION_PATH)
        .once("value");

      setConfig(querySnapshot.val());
      setIsLoading(false);
    }
    fetchApplicationConfiguration();
  }, []);

  return (
    <ApplicationContext.Provider value={{ firebase, config }}>
      <ThemeProvider theme={theme}>
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
          {isLoading && <CircularProgress />}
          {!isLoading && renderMainContent(config)}
        </div>
      </ThemeProvider>
    </ApplicationContext.Provider>
  );
};
