import type { DurationUnit, Pricing } from "./types";

export const PLATFORM_CUT = 0.15;

export interface Quote {
  rental: number;
  cleaningFee: number;
  deposit: number;
  /** What the renter pays now (deposit is held and refunded) */
  total: number;
  hours: number;
  label: string;
}

/**
 * Rental price for a duration.
 * - Hours: first 4h block, then each extra hour at a discounted rate, capped at the day price.
 * - Days: day price, 3-day bundle, then extra days at 70% of the day price.
 */
export function rentalPrice(p: Pricing, amount: number, unit: DurationUnit): number {
  if (unit === "hours") {
    const hrs = Math.max(4, amount);
    const extraHourly = (p.per4h / 4) * 0.6;
    return Math.round(Math.min(p.per4h + (hrs - 4) * extraHourly, p.perDay));
  }
  const days = Math.max(1, amount);
  if (days === 1) return p.perDay;
  if (days === 2) return Math.round(Math.min(p.perDay * 2 * 0.9, p.per3Days));
  if (days === 3) return p.per3Days;
  return Math.round(p.per3Days + (days - 3) * p.perDay * 0.7);
}

export function quote(p: Pricing, amount: number, unit: DurationUnit, cleaningFee: number, deposit: number): Quote {
  const rental = rentalPrice(p, amount, unit);
  return {
    rental,
    cleaningFee,
    deposit,
    total: rental + cleaningFee + deposit,
    hours: unit === "hours" ? amount : amount * 24,
    label: unit === "hours" ? `${amount} hrs` : `${amount} ${amount === 1 ? "day" : "days"}`,
  };
}

export function lenderEarnings(items: number, rentalsPerItem: number, avgPrice: number) {
  return Math.round(items * rentalsPerItem * avgPrice * (1 - PLATFORM_CUT));
}
