import React from "react";
import firebase from "../libs/firebase/firebase";

const ApplicationContext = React.createContext({ firebase });

export default ApplicationContext;
