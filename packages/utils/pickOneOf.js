export function pickOneOf(strings) {
    let l = strings.length - 1;
    return strings[Math.round(l * Math.random())];
}
