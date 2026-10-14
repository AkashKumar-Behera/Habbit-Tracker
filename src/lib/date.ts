export const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Local-time YYYY-MM-DD key — never use toISOString(), it shifts by timezone. */
export function key(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromKey(k: string): Date {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function sameDay(a: Date, b: Date): boolean {
  return key(a) === key(b);
}

export function formatLong(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** 6 x 7 grid starting on the Sunday on or before the 1st. */
export function monthGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = addDays(first, -first.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

/**
 * Columns of 7 days ending on the Saturday of the week containing `end`,
 * going back `weeks` weeks — the GitHub-style contribution layout.
 */
export function heatmapWeeks(end: Date, weeks: number): Date[][] {
  const lastSaturday = addDays(end, 6 - end.getDay());
  const start = addDays(lastSaturday, -(weeks * 7 - 1));
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)),
  );
}

export function monthSpans(cols: Date[][]): { label: string; index: number }[] {
  const spans: { label: string; index: number }[] = [];
  cols.forEach((col, i) => {
    const m = col[0].getMonth();
    if (i === 0 || cols[i - 1][0].getMonth() !== m) {
      spans.push({ label: MONTHS[m], index: i });
    }
  });
  return spans;
}
