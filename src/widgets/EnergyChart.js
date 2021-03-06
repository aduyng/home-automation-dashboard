import React, { useContext, useEffect, useState } from "react";
import { map, sortBy, sumBy } from "lodash";
import moment from "moment";
import numeral from "numeral";
import { ResponsiveBar } from "@nivo/bar";
import { withStyles } from "@material-ui/core/styles";
import { useTheme } from '@material-ui/core/styles';
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Chip from "@material-ui/core/Chip";
import Avatar from "@material-ui/core/Avatar";
import BatteryChargingFull from "@material-ui/icons/BatteryChargingFull";
import SettingsInputComponent from "@material-ui/icons/SettingsInputComponent";
import ReportProblem from "@material-ui/icons/ReportProblem";
import ApplicationContext from "../contexts/ApplicationContext";
import getDailyUsage from "../libs/firebase/energy/getDailyUsage";
import getFifteenMinuteReads from "../libs/firebase/energy/getFifteenMinuteReads";

const styles = theme => ({
  progress: {
    margin: theme.spacing(2)
  },
  chartContainer: {
    height: 500,
    marginBottom: theme.spacing(2)
  },
  dateName: {
    marginLeft: theme.spacing(0.5)
  },
  chip: {
    marginRight: theme.spacing(1)
  },
  root: {
    margin: theme.spacing(1)
  }
});

const EnergyChart = ({ classes }) => {
  const { firebase, config } = useContext(ApplicationContext);
  const [chartData, setChartData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    async function fetchDailyUsage() {
      setIsLoading(true);
      const dailyUsageDoc = await getDailyUsage({ firebase, config });
      const dailyUsage = dailyUsageDoc.data();
      const hourlyStats = {};
      await getFifteenMinuteReads({
        firebase,
        config,
        dailyUsageDoc,
        entryIterator: doc => {
          const { date: docDate, consumption, generation } = doc.data();
          const ts = moment(docDate.toDate());
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
          generation: stat.generation.value(),
          consumptionColor: "hsl(30, 70%, 50%)",
          consumption: stat.consumption.value(),
          generationColor: "hsl(151, 70%, 50%)",
          total: stat.total.value()
        })),
        "index"
      );
      setChartData({
        date: moment(dailyUsage.date.toDate()),
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
  const totalConsumption = numeral(sumBy(entries, "consumption"));
  const totalGeneration = numeral(sumBy(entries, "generation"));
  const excessConsumption = numeral(totalConsumption).subtract(
    totalGeneration.value()
  );

  const excessGeneration = numeral(totalGeneration).subtract(
    totalConsumption.value()
  );

  const chartTheme = {
    axis: {
      ticks: {
        text: {
          fill: theme.palette.common.white
        }
      },
      legend: {
        text:{
          fill: theme.palette.common.white
        }
      },
    }
  };
  return (
    <Card className={classes.root}>
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom variant="subtitle1" component="h2">
          Power Consumption vs. Generation for
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
            labelFormat={value => value.toFixed(2)}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            animate={true}
            motionStiffness={90}
            motionDamping={15}
            theme={chartTheme}
            tooltip={({ id, value, color }) => (
              <strong style={{ color }}>
                {id}: {value.toFixed(2)} kWh
              </strong>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default withStyles(styles)(EnergyChart);
