export function pickOneOf(strings: string[]): string {
  let l = strings.length - 1;
  return strings[Math.round(l * Math.random())]
}