import numeral from "numeral";
import getBaseFeePerDay from "./getBaseFeePerDay";

export default ({ date }) => {
  const baseFee = getBaseFeePerDay({ date });
  const price = numeral(0);
  price.add(process.env.REACT_APP_ENERGY_PRICE);
  price.add(process.env.REACT_APP_ENERGY_TDU_PRICE);
  price.add(baseFee.value());
  return price;
};
