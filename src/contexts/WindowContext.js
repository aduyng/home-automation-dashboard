import React from "react";

const WindowContext = React.createContext({
  width: window.innerWidth,
  height: window.innerHeight
});

export default WindowContext;
