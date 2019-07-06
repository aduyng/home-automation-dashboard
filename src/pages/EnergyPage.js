import React from "react";
import Page from "../components/Page";
import Grid from "@material-ui/core/Grid";
import EnergyChart from "../widgets/EnergyChart";
import EnergyFreeVsPaid from "../widgets/EnergyFreeVsPaid";
import EnergyCostFreeVsPaid from "../widgets/EnergyCostFreeVsPaid";
import TopFiveConsumeHours from "../widgets/TopFiveConsumeHours";

const EnergyPage = () => {
  return (
    <Page>
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <EnergyFreeVsPaid />
        </Grid>
        <Grid item xs={4}>
          <EnergyCostFreeVsPaid />
        </Grid>
        <Grid item xs={4}>
          <TopFiveConsumeHours />
        </Grid>
        <Grid item xs={12}>
          <EnergyChart />
        </Grid>
      </Grid>
    </Page>
  );
};

export default EnergyPage;
