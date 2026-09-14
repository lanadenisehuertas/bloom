/**
 * Returns today's date as a local YYYY-MM-DD string.
 *
 * Deliberately NOT `new Date().toISOString().slice(0, 10)` — that converts to
 * UTC first, so anyone in a timezone ahead of UTC (e.g. the Philippines,
 * UTC+8) who logs something between midnight and their UTC offset filing it
 * under YESTERDAY's date instead of today's. Food logged right after waking
 * up is exactly the case this breaks. New code should use this helper;
 * existing UTC-based date keys elsewhere in the app are a known, separate
 * issue tracked outside this change (see docs/design-system.md).
 */
export function todayLocalDate(): string {
  return toLocalDateString(new Date())
}

export function toLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
