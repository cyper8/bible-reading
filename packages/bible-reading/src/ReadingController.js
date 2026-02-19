const READING_SOURCE = "/reading/json";
export class ReadingController {
    constructor(host) {
        this.today = new Date();
        this.reading = [];
        this.host = host;
        this.today.setHours(0, 0, 0);
        this.getReading();
    }
    getReading() {
        fetch(READING_SOURCE + "?date=" + this.today.toDateString())
            .then(response => response.json())
            .then(reading => {
            this.reading = reading;
            this.host.requestUpdate();
        });
    }
    hostConnected() { }
    hostDisconnected() { }
    hostUpdate() { }
    hostUpdated() { }
}
