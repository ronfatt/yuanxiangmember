import { format, startOfWeek } from "date-fns";

function sumDigits(value: string) {
  return value
    .replace(/\D/g, "")
    .split("")
    .reduce((total, digit) => total + Number(digit), 0);
}

function reduceDigit(value: number) {
  let current = value;
  while (current > 9) {
    current = String(current)
      .split("")
      .reduce((total, digit) => total + Number(digit), 0);
  }
  return current;
}

export function buildFrequencyReport(birthday: string) {
  const lifePath = reduceDigit(sumDigits(birthday));
  const focus = reduceDigit(sumDigits(`${birthday}${new Date().getFullYear()}`));

  return {
    birthday,
    lifePath,
    focus,
    summary:
      lifePath <= 3
        ? "High creative expression. Build routines that turn ideas into consistent action."
        : lifePath <= 6
          ? "Balanced relationship energy. Progress comes from structure, service, and clear boundaries."
          : "Strong introspection energy. Protect focus, pace your commitments, and choose depth over noise.",
    strengths:
      focus <= 3
        ? ["creative momentum", "communication", "fresh starts"]
        : focus <= 6
          ? ["discipline", "stability", "care leadership"]
          : ["strategy", "reflection", "spiritual depth"],
    watchouts:
      focus <= 3
        ? ["scattered attention", "unfinished tasks"]
        : focus <= 6
          ? ["overcommitting", "carrying other people's load"]
          : ["isolation", "analysis without action"]
  };
}

export function buildWeeklyReminder(report: {
  lifePath?: number;
  focus?: number;
  summary?: string;
}) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const tone =
    (report.focus ?? 0) <= 3
      ? "Keep this week simple: one bold action, one follow-up, one clean finish."
      : (report.focus ?? 0) <= 6
        ? "Protect your calendar and stay deliberate: finish core obligations before adding extras."
        : "Leave space for reflection, but convert insight into one measurable move by Friday.";

  return {
    weekStart: format(weekStart, "yyyy-MM-dd"),
    content: `${tone} Current frequency theme: ${report.summary ?? "Stay centered and consistent."} Life path ${report.lifePath ?? "-"}, focus ${report.focus ?? "-"}.`
  };
}
