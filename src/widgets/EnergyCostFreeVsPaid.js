import React from "react";
import EnergyFreeVsPaid from "./EnergyFreeVsPaid";
import getPricePerKWh from "../libs/energy/getPricePerKWh";

const EnergyCostFreeVsPaid = props => {
  return (
    <EnergyFreeVsPaid
      {...props}
      titleCalculator={({ stats }) => {
        return `$${stats.paid.value()} Charge`;
      }}
      valueCalculator={({ date, value }) =>
        parseFloat(
          (
            getPricePerKWh({ date })
              .multiply(value)
              .value() / 100
          ).toFixed(2)
        )
      }
    />
  );
};

export default EnergyCostFreeVsPaid;
