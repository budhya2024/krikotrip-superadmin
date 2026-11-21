export const toPaise = (rupees: number): number => {
  return Math.round(rupees * 100)
}

export const fromPaise = (paise: number | bigint): number => {
  return Number(paise) / 100
}

export const formatInr = (paise: number | bigint): string => {
  const rupees = fromPaise(paise)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees)
}

export const formatDate = (date: string | Date | number): string => {
  const value = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(value)
}

export const formatRelative = (date: string | Date | number): string => {
  const target = (date instanceof Date ? date : new Date(date)).getTime()
  const now = Date.now()
  const diffSeconds = Math.round((target - now) / 1000)

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  const intervals: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [30, 'day'],
    [12, 'month'],
  ]

  let running = Math.abs(diffSeconds)
  let unit: Intl.RelativeTimeFormatUnit = 'second'

  if (running < 60) {
    return rtf.format(diffSeconds, 'second')
  }

  for (const [divisor, nextUnit] of intervals) {
    if (running < divisor) {
      break
    }
    running /= divisor
    unit = nextUnit
  }

  const sign = diffSeconds < 0 ? -1 : 1
  return rtf.format(sign * Math.round(running), unit)
}
