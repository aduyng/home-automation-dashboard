import React from "react";
import { first } from "lodash";
import { withStyles } from "@material-ui/core/styles";
import Page from "./Page";
import Fade from "@material-ui/core/Fade";
import Grid from "@material-ui/core/Grid";
import * as Widgets from "../widgets/index";

const styles = theme => {
  return {
    pageShown: {
      display: "unset"
    },
    pageHidden: {
      display: "none"
    }
  };
};

export default withStyles(styles)(
  class MainContent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        currentPage: first(props.pages),
        currentPageIndex: 0
      };

      this.elapsedInSeconds = 0;
    }

    componentDidMount() {
      this.startTimer();
    }

    componentWillUnmount() {
      this.clearTimeout();
    }

    tick() {
      if (this.elapsedInSeconds <= (this.state.currentPage.duration || 5)) {
        this.elapsedInSeconds++;
        this.clearTimeout();
        return setTimeout(this.tick.bind(this), 1000);
      }

      this.elapsedInSeconds = 0;
      const nextPageIndex =
        this.state.currentPageIndex < this.props.pages.length - 1
          ? this.state.currentPageIndex + 1
          : 0;
      this.setState(
        {
          ...this.state,
          currentPageIndex: nextPageIndex,
          currentPage: this.props.pages[nextPageIndex]
        },
        () => {
          this.clearTimeout();
          return setTimeout(this.tick.bind(this), 1000);
        }
      );
    }

    startTimer() {
      this.clearTimeout();
      this.timeoutHandler = setTimeout(this.tick.bind(this), 1000);
    }

    clearTimeout() {
      if (this.timeoutHandler) {
        clearTimeout(this.timeoutHandler);
      }
    }

    render() {
      const { currentPageIndex } = this.state;
      const { pages, classes } = this.props;
      return pages.map((page, pageIndex) => {
        return (
          <Page
            key={page.name}
            className={
              currentPageIndex === pageIndex
                ? classes.pageShown
                : classes.pageHidden
            }
          >
            <Fade in={currentPageIndex === pageIndex} timeout={2000}>
              <Grid container>
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
            </Fade>
          </Page>
        );
      });
    }
  }
);
