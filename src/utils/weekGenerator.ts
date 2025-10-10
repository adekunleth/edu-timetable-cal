import { format } from "date-fns";

export interface WeekOption {
  weekNumber: number;
  startDate: Date;
  label: string;
}

export function generateWeeksForPeriod(startDateStr: string, endDateStr: string): WeekOption[] {
  const weeks: WeekOption[] = [];
  const semesterStart = new Date(startDateStr);
  const semesterEnd = new Date(endDateStr);
  let currentDate = new Date(semesterStart);
  let weekNumber = 1;
  
  while (currentDate <= semesterEnd) {
    weeks.push({
      weekNumber,
      startDate: new Date(currentDate),
      label: `Week ${weekNumber} - ${format(currentDate, 'MMM dd yyyy')}`
    });
    currentDate.setDate(currentDate.getDate() + 7);
    weekNumber++;
  }
  
  return weeks;
}

export function calculateNumberOfWeeks(startWeek: number, endWeek: number): number {
  return endWeek - startWeek + 1;
}
