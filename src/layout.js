import React from 'react';

import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Alert from '@material-ui/lab/Alert';

import packageJson from '../package.json';
import './layout.scss';
import { tickerService, daysRangeService } from './services/generic-service';

import Header from './components/header/header';
import MostActiveStocksTabs from './components/most-active-stocks-tabs/most-active-stocks-tabs';
import DataGrid from './components/data-grid/data-grid';
import StockFigure from './components/stock-figure/stock-figure';

let arkData = require('./rawData/mergedData.json');

class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: ['most-active-stock-panel', 'candlestick-chart-panel'],
            daysRange: 7,
            inputTicker: '',
            massagedData: [],
            figureTitle: '',
            isFigureLoading: false,
            errorMessage: '',
            isInputing: false
        };

        this.handlePanelChange = this.handlePanelChange.bind(this)
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

        this.daysRangeSubscription = daysRangeService.getDaysRange().subscribe(daysRange => {
            if (daysRange) {
                this.setState({ daysRange: daysRange });
            } else {
                this.setState({ daysRange: 30 });
            }
        });
    }

    componentWillUnmount() {
        this.tickerSubscription.unsubscribe();
        this.daysRangeSubscription.unsubscribe();
    }

    getCandleData(ticker) {
        if (this.state.errorMessage) {
            this.setState({ errorMessage: '' });
        }
        this.setState({ isFigureLoading: true });

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

                if (data.s === 'no_data') {
                    that.setState({ errorMessage: `API returned 'NO DATA' for ${ticker}` });
                }
                
                that.setState({ isFigureLoading: false });
            })
            .catch(error => this.setState({ error }));
    }

    handlePanelChange(panel) {
        return (event, isExpanded) => {
            const panelArr = this.state.expanded;
            if (isExpanded) {
                panelArr.push(panel)
            } else {
                const index = panelArr.indexOf(panel);
                if (index > -1) {
                    panelArr.splice(index, 1);
                }
            }
            this.setState({ expanded: panelArr })
        }
    };

    handleClickDaysRange(event) {
        event.stopPropagation();
    }

    handleSelectDaysRange(event) {
        daysRangeService.changeDaysRange(event.target.value);
    }

    render() {
        let notificationBar;
        if (this.state.errorMessage) {
            notificationBar = <Alert variant="filled" severity="error" onClose={() => { this.setState({ errorMessage: '' }) }}>{this.state.errorMessage}</Alert>
        } else {
            notificationBar = <div></div>
        }
        return (
            <div className="layout-wrapper">
                <div className="header-wrapper">
                    <Header />
                </div>
                <div className="notification-bar-wrapper">
                    {notificationBar}
                </div>
                <div className="accordion-wrapper">
                    <Accordion expanded={this.state.expanded.includes('most-active-stock-panel')} onChange={this.handlePanelChange('most-active-stock-panel')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="most-active-stock-panel-content"
                            id="most-active-stock-panel-header">
                            <Typography className="accordion-heading">Most Active Stocks</Typography>
                            <Typography className="accordion-second-heading" component={'span'}>
                                Top 5 Most Active Stocks that ARK Trades in
                                <FormControl className="days-dropdown">
                                    <Select
                                        labelId="demo-simple-select-placeholder-label-label"
                                        id="demo-simple-select-placeholder-label"
                                        value={this.state.daysRange}
                                        onClick={this.handleClickDaysRange.bind(this)}
                                        onChange={this.handleSelectDaysRange.bind(this)}
                                        MenuProps={{ disableScrollLock: true }}
                                    >
                                        <MenuItem value={1}>1 Day</MenuItem>
                                        <MenuItem value={7}>1 Week</MenuItem>
                                        <MenuItem value={14}>2 Weeks</MenuItem>
                                        <MenuItem value={30}>1 Month</MenuItem>
                                        <MenuItem value={60}>2 Months</MenuItem>
                                        <MenuItem value={10000}>From 08/18/2020</MenuItem>
                                    </Select>
                                </FormControl>
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="most-active-stocks-tabs-wrapper">
                                <MostActiveStocksTabs />
                            </div>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={this.state.expanded.includes('data-grid-panel')} onChange={this.handlePanelChange('data-grid-panel')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="data-grid-panel-content"
                            id="data-grid-panel-header">
                            <Typography className="accordion-heading">Transactions Table</Typography>
                            <Typography className="accordion-second-heading">All ARK Transactions from Aug 18th, 2020</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <DataGrid />
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={this.state.expanded.includes('candlestick-chart-panel')} onChange={this.handlePanelChange('candlestick-chart-panel')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="candlestick-chart-panel-content"
                            id="candlestick-chart-panel-header">
                            <Typography className="accordion-heading">Candlestick Chart</Typography>
                            <Typography className="accordion-second-heading">Two Months Candlestick Chart with ARK Trade Points</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="stock-figure-wrapper">
                                <StockFigure title={this.state.figureTitle.toUpperCase()} data={this.state.massagedData} isLoading={this.state.isFigureLoading} />
                            </div>
                        </AccordionDetails>
                    </Accordion>
                </div>

                <div className='info-container'>
                    <p className='info-version'>Version: {packageJson.version}</p>
                    <p className='info-update-date'>Latest ARK Data: {arkData[0]['Date']}</p>
                </div>
            </div>
        );
    }
}

export default Layout;
