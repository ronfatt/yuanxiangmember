import { formatMoney } from "./helpers";

export type DashboardProfile = {
  id: string;
  name: string | null;
  birthday: string | null;
  referral_code: string;
  tier_rate: number;
  total_referred_sales: number;
  total_commission_earned: number;
  points_balance: number;
  months_under_50: number;
  referred_by: string | null;
};

export function buildKeepAliveLabel(monthsUnder50: number) {
  if (monthsUnder50 >= 1) {
    return `1 strike recorded. Another month below RM50 resets tier progress.`;
  }

  return "Active. Stay above RM50 personal cash spend each month.";
}

export function buildTierHint() {
  return "Strict non-retroactive tiers: the order that crosses a threshold still uses the previous rate.";
}

export function buildPointsHint() {
  return "Points can offset up to 50% of an order. At least 50% must be paid in cash.";
}

export function buildSpendSummary(value: number) {
  return `${formatMoney(value)} this calendar month`;
}
