export function cn(...classes: (string | undefined | null | false | 0 | "")[]): string {
  return classes.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ")
}
