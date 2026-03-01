const POINT_VALUE_RM = 0.1;

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function calcCommissionRate(totalReferredSales: number) {
  if (totalReferredSales >= 10000) return 0.25;
  if (totalReferredSales >= 3000) return 0.2;
  if (totalReferredSales >= 1000) return 0.15;
  return 0;
}

export function calcCommissionForOrder(referrerCurrentRate: number, cashPaid: number) {
  return roundCurrency(cashPaid * referrerCurrentRate);
}

export function calcMaxRedeemablePoints(amountTotal: number, pointsBalance: number) {
  const maxByOrderValue = Math.floor(amountTotal * 5);
  return Math.max(0, Math.min(maxByOrderValue, pointsBalance));
}

export function calcEarnedPoints(cashPaid: number) {
  return Math.max(0, Math.floor(cashPaid / 100) * 10);
}

export function pointsToRinggit(points: number) {
  return roundCurrency(points * POINT_VALUE_RM);
}

export function calcCashPaid(amountTotal: number, pointsRedeemed: number) {
  const redeemedValue = Math.min(pointsToRinggit(pointsRedeemed), amountTotal * 0.5);
  return roundCurrency(amountTotal - redeemedValue);
}
