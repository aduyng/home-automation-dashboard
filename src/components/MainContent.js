import React from "react";
import { filter, sortBy } from "lodash";
import Page from "./Page";
import Grid from "@material-ui/core/Grid";
import * as Widgets from "../widgets/index";

export default ({ pages }) => {
  const activePages = filter(pages, page => page.disabled !== true);
  const sortedPages = sortBy(activePages, "priority");
  return sortedPages.map(page => {
    return (
      <Page key={page.name}>
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
      </Page>
    );
  });
};
