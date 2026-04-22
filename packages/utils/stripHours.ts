export const stripHours = (date: Date) => (date.setHours(0, 0, 0, 0), date);
