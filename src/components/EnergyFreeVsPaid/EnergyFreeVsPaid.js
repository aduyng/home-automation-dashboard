import React, { useContext, useEffect, useState } from "react";
import { map, sortBy, sumBy } from "lodash";
import moment from "moment";
import numeral from "numeral";
import { ResponsivePie } from "@nivo/pie";
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
    height: 240,
    marginBottom: theme.spacing.unit * 2
  },
  dateName: {
    marginLeft: theme.spacing.unit / 2
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

      const freeStartsAt = moment(
        process.env.REACT_APP_FREE_ENERY_PERIOD_STARTS_AT,
        "hh:mm A"
      );
      const freeStartsAtInMinute =
        freeStartsAt.get("hour") * 60 + freeStartsAt.get("minute");
      const freeEndsAt = moment(
        process.env.REACT_APP_FREE_ENERY_PERIOD_ENDS_AT,
        "hh:mm A"
      );
      const freeEndsAtInMinute =
        freeEndsAt.get("hour") * 60 + freeEndsAt.get("minute");
      const stats = {};
      await getFifteenMinuteReads({
        firebase,
        dailyUsageDoc,
        entryIterator: doc => {
          const { timestamp, consumption } = doc.data();
          const ts = moment(timestamp).utc();
          const momentInMinute = ts.get("hour") * 60 + ts.get("minute");
          const key =
            momentInMinute >= freeStartsAtInMinute ||
            momentInMinute < freeEndsAtInMinute
              ? "free"
              : "paid";
          stats[key] = stats[key] || numeral(0);
          stats[key].add(consumption);
        }
      });

      setChartData({
        date: moment(dailyUsage.timestamp),
        entries: map(stats, (value, id) => ({
          id,
          value: value.format("0.0"),
          label: id,
          color: id === "free" ? "hsl(151, 70%, 50%)" : "hsl(30, 70%, 50%)"
        })),
        free: numeral(
          stats.free.value() / (stats.free.value() + stats.paid.value())
        )
      });
      setIsLoading(false);
    }
    fetchDailyUsage();
  }, []);

  if (isLoading) {
    return <CircularProgress className={classes.progress} />;
  }
  const { date, entries, free } = chartData;
  const today = moment();
  return (
    <Card className={classes.root}>
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom variant="subtitle1" component="h2">
          {free.format("0%")} FREE for
          <span className={classes.dateName}>
            {date.calendar(today, { lastDay: "[Yesterday]" })}{" "}
          </span>
          <span className={classes.dateName}>
            {date.format("MMMM Do, YYYY")}
          </span>
        </Typography>

        <div className={classes.chartContainer}>
          <ResponsivePie
            data={entries}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            colors={item => item.color}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            radialLabelsSkipAngle={10}
            radialLabelsTextXOffset={6}
            radialLabelsTextColor="#333333"
            radialLabelsLinkOffset={0}
            radialLabelsLinkDiagonalLength={16}
            radialLabelsLinkHorizontalLength={24}
            radialLabelsLinkStrokeWidth={1}
            radialLabelsLinkColor={{ from: "color" }}
            slicesLabelsSkipAngle={10}
            slicesLabelsTextColor="#333333"
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
