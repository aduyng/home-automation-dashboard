import numeral from "numeral";

export default ({ date, energyBaseFee, energyTDUBaseFee }) => {
  const numberOfDays = date.daysInMonth();
  const monthlyFee = numeral(0);
  monthlyFee.add(energyBaseFee);
  monthlyFee.add(energyTDUBaseFee);
  return monthlyFee.divide(numberOfDays);
};
