import React, { useEffect, useState } from "react";
import { filter, sortBy } from "lodash";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Helmet } from "react-helmet";
import { createMuiTheme } from "@material-ui/core/styles";
import ApplicationContext from "../contexts/ApplicationContext";
import firebase from "../libs/firebase/firebase";
import { ThemeProvider } from "@material-ui/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import MainContent from "./MainContent";
import BlackScreen from "./BlackScreen";

const theme = createMuiTheme({
  palette: {
    type: "dark"
  },
  background: "black"
});

export default () => {
  const [config, setConfig] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState({});

  const registerStateChangeListener = () => {
    firebase
      .database()
      .ref(process.env.REACT_APP_FIREBASE_DASHBOARD_STATE_PATH)
      .on("value", snapshot => {
        const newState = snapshot.val();
        console.log("state changes", newState);
        setState({ ...state, ...newState });
      });
  };

  const registerPresentSensorStateChangeListener = ({ config }) => {
    firebase
      .database()
      .ref(config.presentSensorPath)
      .on("value", snapshot => {
        const val = snapshot.val();
        console.log(`got value of ${config.presentSensorPath}=${val} `);
        setState({ ...state, userPresented: val === "active" });
      });
  };

  const registerConfigChangeListener = () => {
    firebase
      .database()
      .ref(process.env.REACT_APP_FIREBASE_DASHBOARD_CONFIGURATION_PATH)
      .on("value", snapshot => {
        const val = snapshot.val();
        console.log(
          `got new value for ${
            process.env.REACT_APP_FIREBASE_DASHBOARD_CONFIGURATION_PATH
          }`,
          val
        );
        setConfig(val);
      });
  };

  useEffect(() => {
    async function fetchApplicationConfiguration() {
      setIsLoading(true);
      const querySnapshot = await firebase
        .database()
        .ref(process.env.REACT_APP_FIREBASE_DASHBOARD_CONFIGURATION_PATH)
        .once("value");

      const cfg = querySnapshot.val();
      console.log(
        `got new value for ${
          process.env.REACT_APP_FIREBASE_DASHBOARD_CONFIGURATION_PATH
        }`,
        cfg
      );
      setConfig(cfg);

      const stateQuerySnapshot = await firebase
        .database()
        .ref(process.env.REACT_APP_FIREBASE_DASHBOARD_STATE_PATH)
        .once("value");
      setState(stateQuerySnapshot.val());
      setIsLoading(false);

      registerStateChangeListener();
      registerPresentSensorStateChangeListener({ config: cfg });
      registerConfigChangeListener();
    }
    fetchApplicationConfiguration();
  }, []);
  console.log(
    `render the entire application again at: ${new Date().toString()}`,
    config.pages
  );

  const activePages = filter(config.pages, page => page.disabled !== true);
  const sortedPages = sortBy(activePages, "priority");

  return (
    <ApplicationContext.Provider value={{ firebase, config, state }}>
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
          {!isLoading && <BlackScreen show={!state.userPresented} />}
          {!isLoading && <MainContent pages={sortedPages} />}
        </div>
      </ThemeProvider>
    </ApplicationContext.Provider>
  );
};
