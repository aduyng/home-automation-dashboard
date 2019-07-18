import React from "react";
import { withStyles } from "@material-ui/core/styles";

const styles = theme => {
  return {
    root: {
      backgroundColor: theme.palette.common.black,
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }
  };
};

const BlackScreen = ({ classes }) => {
  return <div className={classes.root} />;
};

export default withStyles(styles)(BlackScreen);
