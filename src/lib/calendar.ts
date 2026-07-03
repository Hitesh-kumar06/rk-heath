// Google Calendar "add event" link generator (no OAuth required).
function toGCalDate(iso: string) {
  const d = new Date(iso);
  return d.toISOString().replace(/[-:]|\.\d{3}/g, "");
}

export function googleCalendarLink(opts: {
  title: string;
  start: string;
  durationMinutes?: number;
  details?: string;
  location?: string;
}) {
  const start = new Date(opts.start);
  const end = new Date(start.getTime() + (opts.durationMinutes ?? 30) * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${toGCalDate(start.toISOString())}/${toGCalDate(end.toISOString())}`,
    details: opts.details ?? "",
    location: opts.location ?? "",
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}
