import React from "react";
import Page from "../../components/Page/Page";
import Grid from "@material-ui/core/Grid";
import EnergyChart from "../../components/EnergyChart/EnergyChart";
import EnergyFreeVsPaid from "../../components/EnergyFreeVsPaid/EnergyFreeVsPaid";

const EnergyPage = () => {
  return (
    <Page>
      <Grid container spacing={24}>
        <Grid item xs={4}>
          <EnergyFreeVsPaid />
        </Grid>
        <Grid item xs={12}>
          <EnergyChart />
        </Grid>
      </Grid>
    </Page>
  );
};

export default EnergyPage;
