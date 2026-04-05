import { ReactiveController, ReactiveControllerHost } from "lit";
import { DayData } from "../../day-selector/index.js";


export declare interface ReadingDay extends DayData {
  date: Date;
  reading: string;
  questions: string;
  exposition: string;
}
export type RawReadingDay = { [key in keyof ReadingDay]: string }
export type ReadingDataProvider = (date: Date) => Promise<RawReadingDay[]> | RawReadingDay[];


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

  private _date: Date = stripHours(new Date());
  get date() { return this._date };
  set date(date: Date) {
    const d = stripHours(date);
    this._date = d;
    Promise.resolve(
      this.month.length == 0 || (this.month[1].date.getMonth() !== d.getMonth())
        ? Promise.resolve(this.dataSourse(date))
          .then(rawdays => rawdays.map(
            rawday => objToReadingDay(rawday)
          ))
        : this.month
    )
      .then(days => {
        this.month = days;
        this.day = this.month.find(reading => reading.date.getTime() == d.getTime());
        this.host.requestUpdate();
      })
  }
  month: ReadingDay[] = [];
  day?: ReadingDay;

  private dataSourse: ReadingDataProvider;

  constructor(host: ReactiveControllerHost, dataProvider: ReadingDataProvider) {
    this.host = host;
    this.dataSourse = dataProvider
  }

  hostConnected(): void {
    let params = new URLSearchParams(location.search);
    if (params.has("date")) {
      this.date = stripHours(new Date(params.get("date")!))
    } else this.date = stripHours(new Date());
  }
  hostDisconnected(): void { }
  hostUpdate(): void { }
  hostUpdated(): void { }
}