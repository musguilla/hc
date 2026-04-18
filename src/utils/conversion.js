const XTR_TO_EUR = 0.008;
const EUR_TO_USD = 1.08;

function getEstimatedUSD(amount_xtr) {
  const eur = amount_xtr * XTR_TO_EUR;
  const usd = eur * EUR_TO_USD;
  return parseFloat(usd).toFixed(2);
}

module.exports = {
  XTR_TO_EUR,
  EUR_TO_USD,
  getEstimatedUSD
};
