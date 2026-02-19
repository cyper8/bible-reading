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
        var script = document.createElement('script');
        var nW = Object.defineProperty(window, "handleReadingData", {
            value: (data) => {
                this.reading = data;
                document.head.removeChild(script);
                delete nW.handleReadingData;
                this.host.requestUpdate();
            },
            enumerable: true,
            configurable: true
        });
        script.src = READING_SOURCE + "?date=" + this.today.toDateString() + '&callback=window.handleReadingData';
        document.head.appendChild(script);
    }
    hostConnected() { }
    hostDisconnected() { }
    hostUpdate() { }
    hostUpdated() { }
}
