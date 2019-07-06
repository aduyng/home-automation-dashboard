import React, { useContext, useEffect, useState } from "react";
import { map, sortBy, takeRight } from "lodash";
import moment from "moment";
import numeral from "numeral";
import { ResponsiveBar } from "@nivo/bar";
import { withStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import ApplicationContext from "../contexts/ApplicationContext";
import getDailyUsage from "../libs/firebase/energy/getDailyUsage";
import getFifteenMinuteReads from "../libs/firebase/energy/getFifteenMinuteReads";

const styles = theme => ({
  progress: {
    margin: theme.spacing(2)
  },
  chartContainer: {
    height: 240,
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

      const hourlyStats = {};
      await getFifteenMinuteReads({
        firebase,
        dailyUsageDoc,
        entryIterator: doc => {
          const { date: docDate, consumption, generation } = doc.data();
          const ts = moment(docDate.toDate());
          const momentInMinute = ts.get("hour") * 60 + ts.get("minute");
          const hourKey = ts.format("HH");
          if (
            momentInMinute < freeStartsAtInMinute &&
            momentInMinute >= freeEndsAtInMinute
          ) {
            hourlyStats[hourKey] = hourlyStats[hourKey] || {
              index: parseInt(hourKey, 10),
              hour: ts.format("hA"),
              value: numeral(0)
            };
            hourlyStats[hourKey].value.add(consumption - generation);
          }
        }
      });

      const stats = takeRight(
        sortBy(
          map(hourlyStats, stat => ({
            ...stat,
            consumptionColor: "hsl(151, 70%, 50%)",
            consumption: stat.value.value() * 1000
          })),
          "consumption"
        ),
        5
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

  return (
    <Card className={classes.root}>
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom variant="subtitle1" component="h2">
          Top 5 Consuming Hours
          <span className={classes.dateName}>
            {date.format("MMMM Do, YYYY")}
          </span>
        </Typography>
        <div className={classes.chartContainer}>
          <ResponsiveBar
            data={entries}
            layout="horizontal"
            keys={["consumption"]}
            indexBy="hour"
            margin={{ top: 10, right: 10, bottom: 20, left: 60 }}
            padding={0.3}
            colors={({ id, data }) => data[`${id}Color`]}
            borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0
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
