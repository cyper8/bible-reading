import { ReactiveController, ReactiveControllerHost } from "lit";
export declare const stripHours: (date: Date) => Date;
export declare interface ReadingDay {
    date: Date;
    reading: string;
    questions: string;
    exposition: string;
}
export type ReadingMonth = ReadingDay[];
export declare class ReadingController implements ReactiveController {
    host: ReactiveControllerHost;
    month: ReadingMonth;
    day?: ReadingDay;
    constructor(host: ReactiveControllerHost);
    setReadingDate(date: Date): Promise<void>;
    hostConnected(): void;
    hostDisconnected(): void;
    hostUpdate(): void;
    hostUpdated(): void;
}
//# sourceMappingURL=ReadingController.d.ts.map