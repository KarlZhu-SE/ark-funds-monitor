import { BehaviorSubject } from 'rxjs';

const tickerSubject = new BehaviorSubject('');

const mostActiveDaysRangeSubject = new BehaviorSubject(7);
const candlestickDaysRangeSubject = new BehaviorSubject(30);

export const tickerService = {
    changeTicker: ticker => tickerSubject.next(ticker),
    clearTicker: () => tickerSubject.next(),
    getTicker: () => tickerSubject.asObservable()
};

export const daysRangeService = {
    changeMostActiveDaysRange: daysRange => mostActiveDaysRangeSubject.next(daysRange),
    clearMostActiveDaysRange: () => mostActiveDaysRangeSubject.next(),
    getMostActiveDaysRange: () => mostActiveDaysRangeSubject.asObservable(),

    changeCandlestickDaysRange: daysRange => candlestickDaysRangeSubject.next(daysRange),
    clearCandlestickDaysRange: () => candlestickDaysRangeSubject.next(),
    getCandlestickDaysRange: () => candlestickDaysRangeSubject.asObservable()
};