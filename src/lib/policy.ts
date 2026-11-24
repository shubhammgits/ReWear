/** Booking rules shared by the booking page, the server and the cancellation screens. */

/** Hours an outfit stays blocked after a rental ends, for cleaning and checks */
export const TURNAROUND_HOURS = 24;
/** Earliest start: this many hours from now, so there's time to prepare the outfit */
export const MIN_LEAD_HOURS = 3;
/** How far ahead people can book */
export const MAX_AHEAD_DAYS = 90;
/** Unpaid checkouts hold the dates for this long */
export const HOLD_MINUTES = 15;

const HOUR = 3_600_000;

export interface BusyRange {
  starts_at: string;
  blocked_until: string;
}

/** True if a rental from start for `hours` (plus cleaning time) overlaps any busy range */
export function clashes(start: Date, hours: number, busy: BusyRange[]) {
  const s = start.getTime();
  const until = s + (hours + TURNAROUND_HOURS) * HOUR;
  return busy.some((b) => s < new Date(b.blocked_until).getTime() && new Date(b.starts_at).getTime() < until);
}

export interface RefundableBooking {
  starts_at: string;
  rent: number;
  cleaning_fee: number;
}

/**
 * What a renter gets back when they cancel (see /refunds):
 * 72h+ before start: all rent; 24–72h: half the rent; under 24h: none. The cleaning fee always.
 * The service and protection fees are not refunded.
 */
export function cancellationRefund(b: RefundableBooking, now = new Date()) {
  const hoursLeft = (new Date(b.starts_at).getTime() - now.getTime()) / HOUR;
  const rentShare = hoursLeft >= 72 ? 1 : hoursLeft >= 24 ? 0.5 : 0;
  const rentBack = Math.round(b.rent * rentShare);
  return {
    hoursLeft,
    rentBack,
    /** Rent the renter forfeits; it goes to the lender */
    rentKept: b.rent - rentBack,
    amount: rentBack + b.cleaning_fee,
    rule: rentShare === 1 ? "72 hours or more before pickup" : rentShare === 0.5 ? "between 72 and 24 hours before pickup" : "less than 24 hours before pickup",
  };
}
