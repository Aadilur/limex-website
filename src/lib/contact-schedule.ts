const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;

/** The appointment window exposed by every public contact form. */
export const CONTACT_TIME_SLOTS = Array.from({ length: 19 }, (_, index) => {
  const hour = 9 + Math.floor(index / 2);
  const minute = index % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${minute}`;
});

export function isContactTimeSlot(value: string) {
  return CONTACT_TIME_SLOTS.includes(value);
}

/** Return an ISO date value for the current day in Dhaka time. */
export function getDhakaDateValue(date = new Date()) {
  return new Date(date.getTime() + DHAKA_OFFSET_MS).toISOString().slice(0, 10);
}

/** Return an ISO date value a number of days from today in Dhaka time. */
export function getDhakaDateValueAfter(days: number, date = new Date()) {
  const shifted = new Date(date.getTime() + DHAKA_OFFSET_MS);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
}

export function formatContactTime(value: string) {
  const [hourValue, minute] = value.split(":");
  const hour = Number(hourValue);
  if (!Number.isInteger(hour) || !minute) return value;
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
}
