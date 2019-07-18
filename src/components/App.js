import React, { useEffect, useState } from "react";
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

export default ({ manifest }) => {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState(null);

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

  useEffect(() => {
    async function fetchApplicationConfiguration() {
      setIsLoading(true);
      setConfig({ manifest });
      const querySnapshot = await firebase
        .database()
        .ref(process.env.REACT_APP_FIREBASE_DASHBOARD_CONFIGURATION_PATH)
        .once("value");

      const config = querySnapshot.val();
      setConfig(config);

      const stateQuerySnapshot = await firebase
        .database()
        .ref(process.env.REACT_APP_FIREBASE_DASHBOARD_STATE_PATH)
        .once("value");
      setState(stateQuerySnapshot.val());
      setIsLoading(false);

      registerStateChangeListener();
      registerPresentSensorStateChangeListener({ config });
    }
    fetchApplicationConfiguration();
  }, []);

  console.log("render", Date.now());
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
          {!isLoading && !state.userPresented && <BlackScreen />}
          {!isLoading && state.userPresented && (
            <MainContent pages={config.pages} />
          )}
        </div>
      </ThemeProvider>
    </ApplicationContext.Provider>
  );
};
