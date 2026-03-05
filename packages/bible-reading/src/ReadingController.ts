import { ReactiveController, ReactiveControllerHost } from "lit";
import { getJSONP } from "../../utils/getJSONP.js";
import { DayData } from "../../day-selector/index.js";


export declare interface ReadingDay extends DayData {
  date: Date;
  reading: string;
  questions: string;
  exposition: string;
}
export type RawReadingDay = { [key in keyof ReadingDay]: string }
export type ReadingDataProvider = (date: Date) => Promise<RawReadingDay[]> | RawReadingDay[];
export type ReadingMonth = ReadingDay[];


const DEFAULT_READING_SOURCE = location.origin+"/json";
const defaultReadingDataProvider: ReadingDataProvider = (date: Date) => getJSONP<RawReadingDay[]>(DEFAULT_READING_SOURCE, `date=${date.toDateString()}`);
export const stripHours = (date: Date) => (date.setHours(0, 0, 0, 0), date);
const objToReadingDay: (object: RawReadingDay) => ReadingDay = (object: RawReadingDay) => {
  return {
    date: new Date(object.date),
    reading: object.reading,
    questions: object.questions,
    exposition: object.exposition
  }
}
export function isRawReadingDay(obj: Object): obj is RawReadingDay {
  return (
    "date" in obj &&
    "reading" in obj &&
    "questions" in obj &&
    "exposition" in obj) && (
      typeof obj.date === "string" &&
      typeof obj.reading === "string" &&
      typeof obj.questions === "string" &&
      typeof obj.exposition === "string")
}



export class ReadingController implements ReactiveController {

  host: ReactiveControllerHost;
  month: ReadingMonth = [];
  day?: ReadingDay;
  private dataSourse: ReadingDataProvider;

  constructor(host: ReactiveControllerHost, dataProvider: ReadingDataProvider = defaultReadingDataProvider) {
    this.host = host;
    this.dataSourse = dataProvider
  }

  private loadMonthData(data: RawReadingDay[]) {
    this.month = data
      .map(reading => objToReadingDay(reading))
  }

  async setReadingDate(date: Date) {
    const d = stripHours(date);
    if (this.month.length == 0 || (this.month[1].date.getMonth() !== d.getMonth())) {
      let month = await Promise.resolve(this.dataSourse(date));
      this.loadMonthData(month);
    }
    this.day = this.month.find(reading => reading.date.getTime() == d.getTime());
    this.host.requestUpdate();
  }

  hostConnected(): void { }
  hostDisconnected(): void { }
  hostUpdate(): void { }
  hostUpdated(): void { }
}