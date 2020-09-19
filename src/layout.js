import React from 'react';

import packageJson from '../package.json';
import './layout.scss';
import { tickerService } from './services/ticker-service'

import Header from './components/header/header';
import DataGrid from './components/data-grid/data-grid';
import StockFigure from './components/stock-figure/stock-figure';

let arkData = require('./rawData/mergedData.json');

class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = { inputTicker: '', massagedData: [], figureTitle: '', isInputing: false };
    }

    componentDidMount() {
        this.tickerSubscription = tickerService.getTicker().subscribe(ticker => {
            if (ticker) {
                this.setState({ inputTicker: ticker });
                this.getCandleData(ticker);
            } else {
                this.setState({ ticker: '' });
            }
        });
    }

    componentWillUnmount() {
        this.tickerSubscription.unsubscribe();
    }

    getCandleData(ticker) {
        let that = this;
        let endDate = new Date().setHours(0, 0, 0, 0) / 1000;
        let startDate = endDate - 60 * 24 * 60 * 60;
        let getCandleUrl = 'https://finnhub.io/api/v1/stock/candle?';

        const apiParams = {
            symbol: ticker,
            resolution: 'D',
            from: startDate,
            to: endDate,
            token: 'bti26hf48v6uv69lirj0'
        };
        let paramsArray = [];
        for (let prop in apiParams) {
            paramsArray.push(`${prop}=${apiParams[prop]}`);
        }
        getCandleUrl = getCandleUrl + paramsArray.join('&');

        fetch(getCandleUrl, {
            method: 'GET'
        })
            .then(response => response.json())
            .then((data) => {
                if (data && data.s === 'ok') {
                    let massaged = [];
                    for (let i = 0; i < data.t.length; i++) {
                        let row = [];
                        row.push(
                            new Date(data.t[i] * 1000).toISOString()
                                .split("T")[0],
                            Math.round(data.o[i] * 100) / 100,
                            Math.round(data.c[i] * 100) / 100,
                            Math.round(data.l[i] * 100) / 100,
                            Math.round(data.h[i] * 100) / 100,
                            data.v[i],
                        )
                        massaged.push(row);
                    }

                    that.setState({ figureTitle: ticker });
                    that.setState({ massagedData: massaged });
                }
            })
            .catch(error => this.setState({ error }));
        // event.preventDefault();
    }

    render() {
        console.log('render layout!');
        let subComponent;
        if (this.state.massagedData.length > 0) {
            subComponent = <StockFigure title={this.state.figureTitle.toUpperCase()} data={this.state.massagedData} />;
        } else {
            subComponent =
                <div className="chart-placeholder">
                    <p>
                        Search Any Ticker or Click Any Row/Cell
                        <br></br>
                        Candlestick Chart Will Display Below
                    </p>
                    <svg width="3em" height="3em" viewBox="0 0 16 16" className="bi bi-chevron-double-down" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.646 6.646a.5.5 0 0 1 .708 0L8 12.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                        <path d="M1.646 2.646a.5.5 0 0 1 .708 0L8 8.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                    </svg>
                </div>;
        }

        return (
            <div className="layout-wrapper">
                <div className="header-wrapper">
                    <Header />
                </div>
                <div className="data-grid-wrapper">
                    <DataGrid />
                </div>
                <div className="stock-figure-wrapper">
                    {subComponent}
                </div>
                <div className='info-container'>
                    <p className='info-version'>Version: {packageJson.version}</p>
                    <p className='info-update-date'>Last Update Date: {arkData[0]['Date']}</p>
                </div>
            </div>
        );
    }
}

export default Layout;
