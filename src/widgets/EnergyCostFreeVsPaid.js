import React, { useContext } from "react";
import ApplicationContext from "../contexts/ApplicationContext";
import EnergyFreeVsPaid from "./EnergyFreeVsPaid";
import getPricePerKWh from "../libs/energy/getPricePerKWh";

const EnergyCostFreeVsPaid = props => {
  const { config } = useContext(ApplicationContext);
  return (
    <EnergyFreeVsPaid
      {...props}
      titleCalculator={({ stats }) => {
        return `$${stats.paid.value()} Charge`;
      }}
      valueCalculator={({ date, value }) =>
        parseFloat(
          (
            getPricePerKWh({
              date,
              energyBaseFee: config.energyBaseFee,
              energyTDUBaseFee: config.energyTDUBaseFee,
              energyPrice: config.energyPrice,
              energyTDUPrice: config.energyTDUPrice
            })
              .multiply(value)
              .value() / 100
          ).toFixed(2)
        )
      }
    />
  );
};

export default EnergyCostFreeVsPaid;
