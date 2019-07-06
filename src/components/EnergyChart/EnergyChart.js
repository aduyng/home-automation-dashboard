import React, { useContext, useEffect, useState } from "react";
import { map, sortBy, sumBy } from "lodash";
import moment from "moment";
import numeral from "numeral";
import { ResponsiveBar } from "@nivo/bar";
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Chip from "@material-ui/core/Chip";
import Avatar from "@material-ui/core/Avatar";
import BatteryChargingFull from "@material-ui/icons/BatteryChargingFull";
import SettingsInputComponent from "@material-ui/icons/SettingsInputComponent";
import ReportProblem from "@material-ui/icons/ReportProblem";
import ApplicationContext from "../../contexts/ApplicationContext";
import getDailyUsage from "../../libs/firebase/energy/getDailyUsage";
import getFifteenMinuteReads from "../../libs/firebase/energy/getFifteenMinuteReads";

const styles = theme => ({
  progress: {
    margin: theme.spacing.unit * 2
  },
  chartContainer: {
    height: 500,
    marginBottom: theme.spacing.unit * 2
  },
  dateName: {
    marginLeft: theme.spacing.unit
  },
  chip: {
    marginRight: theme.spacing.unit
  },
  root: {
    margin: theme.spacing.unit
  }
});

const EnergyChart = ({ classes }) => {
  const { firebase } = useContext(ApplicationContext);
  const [chartData, setChartData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDailyUsage() {
      setIsLoading(true);
      const dailyUsageDoc = await getDailyUsage({ firebase });
      const dailyUsage = dailyUsageDoc.data();
      const hourlyStats = {};
      await getFifteenMinuteReads({
        firebase,
        dailyUsageDoc,
        entryIterator: doc => {
          const { timestamp, consumption, generation } = doc.data();
          const ts = moment(timestamp).utc();
          const hourKey = ts.format("HH");
          hourlyStats[hourKey] = hourlyStats[hourKey] || {
            index: parseInt(hourKey, 10),
            hour: ts.format("hA"),
            consumption: numeral(0),
            generation: numeral(0),
            total: numeral(0)
          };
          hourlyStats[hourKey].consumption.add(consumption);
          hourlyStats[hourKey].generation.add(generation);
          hourlyStats[hourKey].total.add(generation + consumption);
        }
      });

      const stats = sortBy(
        map(hourlyStats, stat => ({
          ...stat,
          generation: stat.generation.value() * 1000,
          consumptionColor: "hsl(30, 70%, 50%)",
          consumption: stat.consumption.value() * 1000,
          generationColor: "hsl(151, 70%, 50%)",
          total: stat.total.value() * 1000
        })),
        "index"
      );
      setChartData({
        date: moment(dailyUsage.timestamp),
        entries: stats
      });
      setIsLoading(false);
    }
    fetchDailyUsage();
  }, []);

  if (isLoading) {
    return <CircularProgress className={classes.progress} size={50} />;
  }
  const { date, entries } = chartData;
  const today = moment();
  const totalConsumption = numeral(sumBy(entries, "consumption") / 1000);
  const totalGeneration = numeral(sumBy(entries, "generation") / 1000);
  const excessConsumption = numeral(totalConsumption).subtract(
    totalGeneration.value()
  );

  const excessGeneration = numeral(totalGeneration).subtract(
    totalConsumption.value()
  );
  return (
    <Card className={classes.root}>
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom variant="h5" component="h2">
          Power Consumption vs. Generation for
          <span className={classes.dateName}>
            {date.calendar(today, { lastDay: "[Yesterday]" })}{" "}
          </span>
          <span className={classes.dateName}>
            {date.format("MMMM Do, YYYY")}
          </span>
        </Typography>
        <div className="chips">
          <Chip
            avatar={
              <Avatar>
                <SettingsInputComponent />
              </Avatar>
            }
            color="secondary"
            label={`Consumption: ${totalConsumption.format("0.0")} kWh`}
            className={classes.chip}
          />
          <Chip
            avatar={
              <Avatar>
                <BatteryChargingFull />
              </Avatar>
            }
            color="primary"
            label={`Generation: ${totalGeneration.format("0.0")} kWh`}
            className={classes.chip}
          />
          {excessConsumption.value() > 0 && (
            <Chip
              avatar={
                <Avatar>
                  <ReportProblem />
                </Avatar>
              }
              label={`Excess Consumption: ${excessConsumption.format(
                "0.0"
              )} kWh`}
              color="secondary"
              className={classes.chip}
            />
          )}
          {excessGeneration.value() > 0 && (
            <Chip
              avatar={
                <Avatar>
                  <ReportProblem />
                </Avatar>
              }
              label={`Excess Generation: ${excessGeneration.format("0.0")} kWh`}
              color="primary"
              className={classes.chip}
            />
          )}
        </div>

        <div className={classes.chartContainer}>
          <ResponsiveBar
            data={entries}
            keys={["consumption", "generation"]}
            indexBy="hour"
            margin={{ top: 50, right: 10, bottom: 50, left: 60 }}
            padding={0.3}
            colors={({ id, data }) => data[`${id}Color`]}
            borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Time of the day",
              legendPosition: "middle",
              legendOffset: 32
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "wH",
              legendPosition: "middle",
              legendOffset: -50
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            animate={true}
            motionStiffness={90}
            motionDamping={15}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default withStyles(styles)(EnergyChart);
