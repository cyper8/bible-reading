import { ReactiveController, ReactiveControllerHost } from "lit";
import { DayData } from "../../day-selector/index.js";
export declare interface ReadingDay extends DayData {
    date: Date;
    reading: string;
    questions: string;
    exposition: string;
}
export type RawReadingDay = {
    [key in keyof ReadingDay]: string;
};
export type ReadingDataProvider = (date: Date) => Promise<RawReadingDay[]> | RawReadingDay[];
export type ReadingMonth = ReadingDay[];
export declare const stripHours: (date: Date) => Date;
export declare function isRawReadingDay(obj: Object): obj is RawReadingDay;
export declare class ReadingController implements ReactiveController {
    host: ReactiveControllerHost;
    month: ReadingMonth;
    day?: ReadingDay;
    private dataSourse;
    constructor(host: ReactiveControllerHost, dataProvider?: ReadingDataProvider);
    private loadMonthData;
    setReadingDate(date: Date): Promise<void>;
    hostConnected(): void;
    hostDisconnected(): void;
    hostUpdate(): void;
    hostUpdated(): void;
}
//# sourceMappingURL=ReadingController.d.ts.map