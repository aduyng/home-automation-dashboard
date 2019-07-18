import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Fade from "@material-ui/core/Fade";

const styles = theme => {
  return {
    root: {
      backgroundColor: theme.palette.common.black,
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1
    }
  };
};

const BlackScreen = ({ classes, show }) => {
  return (
    <Fade in={show}>
      <div className={classes.root} />
    </Fade>
  );
};

export default withStyles(styles)(BlackScreen);
