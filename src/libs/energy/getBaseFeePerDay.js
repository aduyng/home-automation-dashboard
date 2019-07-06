import numeral from "numeral";

export default ({ date }) => {
  const numberOfDays = date.daysInMonth();
  const monthlyFee = numeral(0);
  monthlyFee.add(process.env.REACT_APP_ENERGY_BASE_FEE);
  monthlyFee.add(process.env.REACT_APP_ENERGY_TDU_BASE_FEE);
  return monthlyFee.divide(numberOfDays);
};
