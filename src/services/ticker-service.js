import { Subject } from 'rxjs';

const tickerSubject = new Subject('');

export const tickerService = {
    changeTicker: ticker => tickerSubject.next(ticker),
    clearTicker: () => tickerSubject.next(),
    getTicker: () => tickerSubject.asObservable()
};