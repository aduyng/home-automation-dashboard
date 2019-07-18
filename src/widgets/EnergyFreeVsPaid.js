import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import numeral from "numeral";
import { ResponsivePie } from "@nivo/pie";
import { withStyles } from "@material-ui/core/styles";
import { useTheme } from '@material-ui/core/styles';
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
  root: {
    margin: theme.spacing(1)
  }
});

const EnergyFreeVsPaid = ({
  classes,
  valueCalculator = ({ value }) => value,
  titleCalculator = ({ stats }) => {
    const free = numeral(
      (stats.free.value() + stats.solar.value()) /
        (stats.free.value() + stats.paid.value() + stats.solar.value())
    );
    return `${free.format("0%")} FREE (kWh)`;
  }
}) => {
  const { firebase, config } = useContext(ApplicationContext);
  const [chartData, setChartData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    async function fetchDailyUsage() {
      setIsLoading(true);
      const dailyUsageDoc = await getDailyUsage({ firebase, config });
      const dailyUsage = dailyUsageDoc.data();

      const freeStartsAt = moment(config.freeEnergyPeriodStartsAt, "hh:mm A");

      const freeStartsAtInMinute =
        freeStartsAt.get("hour") * 60 + freeStartsAt.get("minute");

      const freeEndsAt = moment(config.freeEnergyPeriodEndsAt, "hh:mm A");
      const freeEndsAtInMinute =
        freeEndsAt.get("hour") * 60 + freeEndsAt.get("minute");

      const stats = {
        free: numeral(0),
        paid: numeral(0),
        solar: numeral(0)
      };
      await getFifteenMinuteReads({
        firebase,
        config,
        dailyUsageDoc,
        entryIterator: doc => {
          const { date: docDate, consumption, generation } = doc.data();
          const ts = moment(docDate.toDate());
          const momentInMinute = ts.get("hour") * 60 + ts.get("minute");
          const key =
            momentInMinute >= freeStartsAtInMinute ||
            momentInMinute < freeEndsAtInMinute
              ? "free"
              : "paid";
          stats[key].add(valueCalculator({ value: consumption, date: ts }));
          stats.solar.add(valueCalculator({ value: generation, date: ts }));
        }
      });

      setChartData({
        date: moment(dailyUsage.date.toDate()),
        stats,
        entries: [
          {
            id: "free",
            value: stats.free.value(),
            label: "Free",
            color: "hsl(160, 70%, 50%)"
          },
          {
            id: "solar",
            value: stats.solar.value(),
            label: "Solar",
            color: "hsl(90, 70%, 50%)"
          },
          {
            id: "charge",
            value: stats.paid.value(),
            label: "Charge",
            color: "hsl(30, 70%, 50%)"
          }
        ]
      });
      setIsLoading(false);
    }
    fetchDailyUsage();
  }, []);

  if (isLoading) {
    return <CircularProgress className={classes.progress} />;
  }
  const { date, entries, stats } = chartData;

  return (
    <Card className={classes.root}>
      <CardContent className={classes.cardContent}>
        <Typography gutterBottom variant="subtitle1" component="h2">
          {titleCalculator({ stats })} for
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
            radialLabelsTextColor={theme.palette.common.white}
            radialLabelsLinkOffset={0}
            radialLabelsLinkDiagonalLength={16}
            radialLabelsLinkHorizontalLength={24}
            radialLabelsLinkStrokeWidth={1}
            radialLabelsLinkColor={{ from: "color" }}
            slicesLabelsSkipAngle={10}
            slicesLabelsTextColor={theme.palette.common.white}
            animate={true}
            motionStiffness={90}
            motionDamping={15}
            tooltip={({ id, value, color }) => (
              <strong style={{ color }}>
                {id}: {value}
              </strong>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default withStyles(styles)(EnergyFreeVsPaid);
