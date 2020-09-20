import { Subject, BehaviorSubject } from 'rxjs';

const tickerSubject = new Subject('');

const daysRangeSubject = new BehaviorSubject(30);

export const tickerService = {
    changeTicker: ticker => tickerSubject.next(ticker),
    clearTicker: () => tickerSubject.next(),
    getTicker: () => tickerSubject.asObservable()
};

export const daysRangeService = {
    changeDaysRange: daysRange => daysRangeSubject.next(daysRange),
    clearDaysRange: () => daysRangeSubject.next(),
    getDaysRange: () => daysRangeSubject.asObservable()
};