import { DateMarker, arrayToUtcDate, dateToUtcArray } from './marker.js'
import moment from 'moment-jalaali'

export interface CalendarSystem {
  getMarkerYear(d: DateMarker): number
  getMarkerMonth(d: DateMarker): number
  getMarkerDay(d: DateMarker): number
  getMarkerDayOfWeek(d: DateMarker): number
  arrayToMarker(arr: number[]): DateMarker
  markerToArray(d: DateMarker): number[]
}

let calendarSystemClassMap = {}

export function registerCalendarSystem(name, theClass) {
  calendarSystemClassMap[name] = theClass
}

export function createCalendarSystem(name) {
  return new (calendarSystemClassMap[name] || GregorianCalendarSystem)()
}

class GregorianCalendarSystem implements CalendarSystem {
  getMarkerYear(d: DateMarker) {
    return d.getUTCFullYear()
  }

  getMarkerMonth(d: DateMarker) {
    return d.getUTCMonth()
  }

  getMarkerDay(d: DateMarker) {
    return d.getUTCDate()
  }

  getMarkerDayOfWeek(d: DateMarker) {
    return d.getUTCDay()
  }

  arrayToMarker(arr) {
    return arrayToUtcDate(arr)
  }

  markerToArray(marker) {
    return dateToUtcArray(marker)
  }
}

class JalaliCalendarSystem implements CalendarSystem {
  getMarkerYear(d: DateMarker) {
    const year = d.getUTCFullYear()
    if (year < 1500) return year
    return moment(d).jYear()
  }

  getMarkerMonth(d: DateMarker) {
    return moment(d).jMonth()
  }

  getMarkerDay(d: DateMarker) {
    return moment(d).jDate()
  }

  getMarkerDayOfWeek(d: DateMarker) {
    return moment(d).day()
  }

  arrayToMarker(arr: number[]) {
    if (arr.length === 1)
      arr = arr.concat([0])
    arr[1] += 1

    const arrStr = arr.map(t => {
      if (t < 0)
        return '01'
      if (t.toString().length > 2)
        return t.toString()
      else
        return ['0'].concat(t.toString().split('')).slice(-2).join('')
    }).join('')

    let d = moment(arrStr, 'jYYYYjMMjDDHHmmssSS').utc(true)
    if (arr[2] < 0) {
      d.subtract(-arr[2] + 1, 'day')
    }
    if (d.format('jMMjDD') === '1130')
      console.log({
        arr: arr.toString(),
        d: d.format(),
      })

    const date = d.toDate()
    return date
  }

  markerToArray(marker) {
    const m = moment(marker)//.utc(false)
    return ['jYear', 'jMonth', 'jDate', 'hour', 'minute', 'second', 'millisecond']
      .map(t => m[t]())
  }
}

registerCalendarSystem('gregory', GregorianCalendarSystem)
registerCalendarSystem('jalali', JalaliCalendarSystem)
