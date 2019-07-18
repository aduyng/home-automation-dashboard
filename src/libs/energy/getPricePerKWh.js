import numeral from "numeral";
import getBaseFeePerDay from "./getBaseFeePerDay";

export default ({ date, energyBaseFee, energyTDUBaseFee, energyPrice, energyTDUPrice }) => {
  const baseFee = getBaseFeePerDay({ date, energyBaseFee, energyTDUBaseFee });
  const price = numeral(0);
  price.add(energyPrice);
  price.add(energyTDUPrice);
  price.add(baseFee.value());
  return price;
};
