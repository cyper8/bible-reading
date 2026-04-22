import { LitElement, PropertyValues, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { stripHours } from "../../utils/stripHours.js";

export interface DayData {
  date: Date
}

export declare type DateSelectedEvent<T extends DayData> = CustomEvent<T> & {
  type: 'date-selected'
}

/** zero-based day of week (like Date.prototype.getDay) but locale-corrected (if supported by browser) */
const getLocaleDayOfWeek = (date: Date): number => {
  const locale = new Intl.Locale(navigator.language);
  var weekStart;
  if ("getWeekInfo" in locale) {
    weekStart = (locale.getWeekInfo as Function)().firstDay as number;
  } else {
    weekStart = navigator.languages.includes("uk") ? 1 : 7;
  }
  return (date.getDay() + 7 - weekStart) % 7
}

const weekDaysNames: string[] = Array(7)
  .fill(0).map((_d, n) => new Date(0, 0, n))
  .reduce((w: Array<any>, d) => w.with(d.getDay() - 1, d.toLocaleDateString(undefined, { weekday: "short" })), Array(7));

const daysInMonth = (m0: number, y?: number): number => {
  let d = new Date();
  d.setFullYear(y || d.getFullYear())
  d.setMonth(m0 + 1);
  d.setDate(0);
  return d.getDate()
}

@customElement('day-selector')
export class DaySelector<T extends DayData> extends LitElement {

  @property({ type: String }) date: string = stripHours(new Date()).toDateString();
  @property({ type: Array }) month: T[] = [];

  private genMonth(monthData: T[], currentDate: Date = stripHours(new Date())) {
    let month = currentDate.getMonth();
    let year = currentDate.getFullYear();
    let today = currentDate.getDate();
    let day1 = new Date(year, month, 1, 0, 0, 0, 0);
    let firstDayOffset = getLocaleDayOfWeek(day1) || 7; // if the month starts from first weekday, add whole week for "to previous month" option plus compensate
    let monthLength = daysInMonth(month, year);
    let calendarDaysData: (T | undefined)[] = Array(monthLength + 2).fill(undefined);
    monthData.forEach((day) => {
      calendarDaysData[day.date.getDate()] = day
    });
    return html`<section class="calendar">
      ${weekDaysNames.map(weekdayname => html`<div class="day header">${weekdayname}</div>`)}
      ${calendarDaysData.map(
      (dayData, n, a) => {
        let date = new Date(year, month, n, 0, 0, 0, 0);
        let dayOfWeek = getLocaleDayOfWeek(date);
        let isToday = (n == today);
        let nextMonth = (n == a.length - 1);
        let prevMonth = (n == 0);
        let empty = dayData == undefined;
        return html`<div class="${classMap({
          day: true,
          ffwd: nextMonth,
          rewd: prevMonth,
          empty: (empty || nextMonth || prevMonth),
          selected: isToday,
          weekend: dayOfWeek > 4
        })}"
          style="${styleMap({
          'grid-column': `span ${prevMonth ? firstDayOffset : (nextMonth ? 7 - dayOfWeek : 1)}`
        })}"
          @click="${() => {
            this.date = date.toDateString();
          }
          }">${n}</div>`
      }
    )}</section>`
  }

  private reportData(data: T) {
    this.dispatchEvent(new CustomEvent<T>('date-selected', {
      detail: data,
      bubbles: true,
      composed: true
    }) as DateSelectedEvent<T>)
  }

  protected updated(_changedProperties: PropertyValues<this>): void {
    if (_changedProperties.has("date")) {
      let date = stripHours(new Date(this.date));
      if (this.month.length) {
        let data = this.month.filter(dd => dd.date.getTime() === date.getTime())[0];
        this.reportData({
          ...(data || {}),
          date,
        } as T);
      }
    }
  }

  protected render() {
    let date = new Date(this.date);
    return html`
    <label class="icon" id="clock" for="date-selector-switch">
      ${date.toLocaleDateString(
      navigator.language,
      { dateStyle: 'long' }
    )}<input type=checkbox id="date-selector-switch" hidden />
      <div class="date-selector">
        ${this.genMonth(this.month, date)}
      </div>
    </label>
    
    `
  }

  /**
   * --day-selector-background
   * --day-selector-color
   * --day-selector-hilight
   * --day-selector-hilight-accent
   */

  static get styles() {
    return css`
    :host {
      --_this-color: var(--day-selector-color, #fafafa);
      --_this-background: var(--day-selector-background, #242424);
      --_this-hilight: var(--day-selector-hilight, rgba(200,200,200,0.3));
      --_this-hilight-accent: var(--day-selector-hilight-accent, rgba(200,255,255,0.3));

      display: inline-block;
      margin: 0.2em;
      padding: 0.2em;
      border: solid 1px var(--_this-color);
      border-radius: 1.2em;
      line-height: 2em
    }
    @media (prefers-color-scheme: light) {
      :host {
        --_this-color: var(--day-selector-background, #242424);
        --_this-background: var(--day-selector-color, #fafafa);
      }
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
      border: solid 1px var(--_this-color);
      border-radius: 50%;
      background-color: var(--_this-background);
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
      top: 0.25em;
      background-color: currentColor;
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
      background-color: var(--_this-color);
      color: var(--_this-background);
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
            background-color: var(--_this-hilight);
            &:not(.empty) {
              background-color: var(--_this-hilight-accent);
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
        color: var(--_this-background);
      }
      .ffwd::before {
        content: '>>';
        color: var(--_this-background);
      }
    }
    `
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'day-selector': DaySelector<any>;
  }
}