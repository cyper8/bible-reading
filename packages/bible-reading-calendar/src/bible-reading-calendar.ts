import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

export declare interface ReadingDay {
  date: Date;
  reading: string;
  questions: string;
  exposition: string;
}

export declare type ReadingDateSelectedEvent = CustomEvent<ReadingDay> & {
  type: 'reading-date-selected'
}

const daysInMonth = (m0: number, y?: number) => {
  let d = new Date();
  d.setFullYear(y || d.getFullYear())
  d.setMonth(m0 + 1);
  d.setDate(0);
  return d.getDate()
}

@customElement('bible-reading-calendar')
export class BibleReadingCalendar extends LitElement {

  @property({ type: Date }) date: Date = new Date();
  @property({ type: Array }) reading: ReadingDay[] = [];

  private genMonth(data: ReadingDay[], currentReadingDate: Date = new Date()) {
    const week = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
    let month = currentReadingDate.getMonth();
    let year = currentReadingDate.getFullYear();
    let theday = currentReadingDate.getDate();
    let day1 = new Date(year, month, 1);
    let offset = (day1.getDay() + 7 - 1) % 7 || 7;
    let length = daysInMonth(month, year);
    let monthData = data;
    let gen: (ReadingDay | undefined)[] = Array(length + 2).fill(undefined);
    monthData.forEach(day => {
      gen[day.date.getDate()] = day
    });
    return html`<section class="calendar">
      ${week.map(d => html`<div class="day header">${d}</div>`)}
      ${gen.map(
      (d, n, a) => {
        let date = new Date(year, month, n);
        let dw = (n + offset - 1) % 7;
        let today = (n == theday);
        let ffwd = (n == a.length - 1);
        let rewd = (n == 0);
        let empty = d == undefined;
        return html`<div class="${classMap({
          day: true,
          ffwd,
          rewd,
          empty: (empty || ffwd || rewd),
          selected: today,
          weekend: dw > 4
        })}"
          style="${styleMap({
          'grid-column': `span ${rewd ? offset : (ffwd ? 7 - dw : 1)}`
        })}"
          @click="${() => {
            if (ffwd || rewd || !(today || empty)) {
              this.date = date;
              this.reportData({
                date,
                reading: '',
                questions: '',
                exposition: '',
                ...d
              } as ReadingDay);
            }
          }
          }">${n}</div>`
      }
    )}</section>`
  }

  private reportData(reading: ReadingDay) {
    this.dispatchEvent(new CustomEvent<ReadingDay>('reading-date-selected', {
      detail: reading,
      bubbles: true,
      composed: true
    }) as ReadingDateSelectedEvent)
  }

  protected render() {
    return html`
    <label class="icon" id="clock" for="date-selector-switch">
      ${(this.date).toLocaleDateString(
      navigator.language,
      { dateStyle: 'long' }
    )}<input type=checkbox id="date-selector-switch" hidden />
      <div class="date-selector">
        ${this.genMonth(this.reading, this.date)}
      </div>
    </label>
    
    `
  }

  static get styles() {
    return css`
    :host {
      display: inline-block;
      margin: 0.2em;
      padding: 0.2em;
      border: solid 1px var(--bible-excerpt-color);
      border-radius: 1.2em;
      line-height: 2em
    }
    #clock.icon {
      position: relative
    }
    #clock.icon::before {
      content: '';
      margin: 0.2em;
      display: block;
      float: left;
      width: 1.5em;
      height: 1.5em;
      border-radius: 50%;
      background-color: currentColor;
      position: relative;
    }
    #clock.icon::after {
      content: '';
      width: 0.1em;
      height: 0.5em;
      border: none ;
      border-radius: 0.05em;
      position: absolute;
      left: -1.05em;
      top: 0.05em;
      background-color: var(--bible-excerpt-background);
      transform-origin: center bottom;
      transform: rotate(35deg);
      transition: transform 2s linear;
    }
    #clock.icon:hover::after {
      transform: rotate(-360deg)
    }
    .date-selector {
      display: none;
      position: absolute;
      width: auto;
      height: auto;
      background-color: var(--bible-excerpt-color);
      color: var(--bible-excerpt-background);
      border-radius: 1em;
      padding: 1em;
    }
    input#date-selector-switch:checked+.date-selector {
      display: block
    }
    .calendar {
      border-radius: 0.2em;
      border: none;
      display: grid;
      grid-template-columns: repeat(7, 2em);
      .day {
        &:not(.header) {
          &:hover {
            background-color: var(--bible-excerpt-hilight, rgba(200,200,200,0.3));
            &:not(.empty) {
              background-color: var(--bible-excerpt-hilight-accent, rgba(200,225,255,0.3));
            }
          }
        }
        &.header, &.selected {
          font-weight: bold;
        }
      }
      .weekend, .empty {
        filter: brightness(80%);
      }
      .rewd, .ffwd {
        color: transparent;
        text-align: center;
      }
      .rewd::after {
        content: '<<';
        color: var(--bible-excerpt-background);
      }
      .ffwd::before {
        content: '>>';
        color: var(--bible-excerpt-background);
      }
    }
    `
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'bible-reading-calendar': BibleReadingCalendar;
  }
}