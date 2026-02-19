import { ReactiveController, ReactiveControllerHost } from "lit";
export declare interface ReadingDay {
    date: Date;
    reading: string;
    questions: string;
    exposition: string;
}
export declare class ReadingController implements ReactiveController {
    today: Date;
    reading: ReadingDay[];
    host: ReactiveControllerHost;
    constructor(host: ReactiveControllerHost);
    static handleReadingData: Function | undefined;
    getReading(): void;
    hostConnected(): void;
    hostDisconnected(): void;
    hostUpdate(): void;
    hostUpdated(): void;
}
//# sourceMappingURL=ReadingController.d.ts.map