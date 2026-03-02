import { getJSONP } from "../../utils/getJSONP.js";
const READING_SOURCE = "/reading/json";
export const stripHours = (date) => (date.setHours(0, 0, 0), date);
export class ReadingController {
    constructor(host) {
        this.month = [];
        this.host = host;
    }
    async setReadingDate(date) {
        const d = stripHours(date);
        if (this.month.length == 0 || (this.month[1].date.getMonth() !== d.getMonth())) {
            this.month = await getJSONP(READING_SOURCE, `date=${date.toDateString()}`);
        }
        this.day = this.month.find(reading => reading.date.getTime() == d.getTime());
        this.host.requestUpdate();
    }
    hostConnected() { }
    hostDisconnected() { }
    hostUpdate() { }
    hostUpdated() { }
}
