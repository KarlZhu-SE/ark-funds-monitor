import React from 'react';
import {
    Accordion, Grid, AccordionDetails, AccordionSummary,
    Typography, MenuItem, FormControl, Select
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Alert from '@material-ui/lab/Alert';

import packageJson from '../package.json';
import './layout.scss';
import { tickerService, daysRangeService } from './services/generic-service';
import Header from './components/header/header';
import MostActiveStocksTabs from './components/most-active-stocks-tabs/most-active-stocks-tabs';
import DataGrid from './components/data-grid/data-grid';
import StockFigure from './components/stock-details/stock-figure/stock-figure';

let arkData = require('./rawData/mergedData.json');

class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: ['most-active-stock-panel'],
            mostActiveDaysRange: 7,
            candlestickDaysRange: 30,
            inputTicker: '',
            massagedData: [],
            figureTitle: '',
            isFigureLoading: false,
            errorMessage: '',
            isInputing: false
        };

        this.handlePanelChange = this.handlePanelChange.bind(this);
        this.handleClickDaysRange = this.handleClickDaysRange.bind(this);
        this.handleSelectDaysRange = this.handleSelectDaysRange.bind(this);
    }

    componentDidMount() {
        this.tickerSubscription = tickerService.getTicker().subscribe(ticker => {
            if (ticker) {
                this.setState({ inputTicker: ticker });
                this.getCandleData(ticker, this.state.candlestickDaysRange);

                // expand stock details section if it is closed
                const panelArr = this.state.expanded;
                if (panelArr.indexOf('stock-details-panel') === -1) {
                    panelArr.push('stock-details-panel');
                }
                this.setState({ expanded: panelArr });

            } else {
                this.setState({ ticker: '' });
            }
        });

        this.mostActiveDaysRangeSubscription = daysRangeService.getMostActiveDaysRange().subscribe(mostActiveDaysRange => {
            if (mostActiveDaysRange) {
                this.setState({ mostActiveDaysRange: mostActiveDaysRange });
            } else {
                this.setState({ mostActiveDaysRange: 30 });
            }
        });

        this.candlestickDaysRangeSubscription = daysRangeService.getCandlestickDaysRange().subscribe(candlestickDaysRange => {
            if (candlestickDaysRange) {
                this.setState({ candlestickDaysRange: candlestickDaysRange });
            } else {
                this.setState({ candlestickDaysRange: 30 });
            }
        });
    }

    componentWillUnmount() {
        this.tickerSubscription.unsubscribe();
        this.mostActiveDaysRangeSubscription.unsubscribe();
    }

    getCandleData(ticker, daysRange) {
        if (this.state.errorMessage) {
            this.setState({ errorMessage: '' });
        }
        this.setState({ isFigureLoading: true });

        let that = this;
        let endDate = new Date().setHours(0, 0, 0, 0) / 1000;
        let startDate = endDate - daysRange * 24 * 60 * 60;
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
            this.setState({ expanded: panelArr });
        }
    };

    handleClickDaysRange(event) {
        event.stopPropagation();
    }

    handleSelectDaysRange(event, type) {
        switch (type) {
            case 'mostActive':
                daysRangeService.changeMostActiveDaysRange(event.target.value);
                break;
            case 'candlestick':
                daysRangeService.changeCandlestickDaysRange(event.target.value);
                if (this.state.massagedData.length > 0) {
                    this.getCandleData(this.state.inputTicker, event.target.value)
                }
                break;
            default:
                break;
        }
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

                            <Grid item xs={5} md={4}>
                                <Typography className="accordion-heading">Most Active Stocks</Typography>
                            </Grid>

                            <Grid item xs={7} md={4} className="second-heading-wrapper">
                                <Typography className="accordion-second-heading" component={'span'}>
                                    Top 10 Most Active Stocks that ARK Trades in
                                <FormControl className="days-dropdown">
                                        <Select
                                            labelId="demo-simple-select-placeholder-label-label"
                                            id="demo-simple-select-placeholder-label"
                                            value={this.state.mostActiveDaysRange}
                                            onClick={(e) => this.handleClickDaysRange(e)}
                                            onChange={(e) => this.handleSelectDaysRange(e, 'mostActive')}
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
                            </Grid>

                        </AccordionSummary>

                        <AccordionDetails>
                            <div className="most-active-stocks-tabs-wrapper">
                                <MostActiveStocksTabs />
                            </div>
                        </AccordionDetails>

                    </Accordion>

                    <Accordion expanded={this.state.expanded.includes('stock-details-panel')} onChange={this.handlePanelChange('stock-details-panel')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="stock-details-panel-content"
                            id="stock-details-panel-header">

                            <Grid item xs={5} md={4}>
                                <Typography className="accordion-heading">Stock Details</Typography>
                            </Grid>

                            <Grid item xs={7} md={4} className="second-heading-wrapper">
                                <Typography className="accordion-second-heading" component={'span'}>
                                    <FormControl className="days-dropdown">
                                        <Select
                                            labelId="demo-simple-select-placeholder-label-label"
                                            id="demo-simple-select-placeholder-label"
                                            value={this.state.candlestickDaysRange}
                                            onClick={(e) => this.handleClickDaysRange(e)}
                                            onChange={(e) => this.handleSelectDaysRange(e, 'candlestick')}
                                            MenuProps={{ disableScrollLock: true }}
                                        >
                                            <MenuItem value={7}>1 Week</MenuItem>
                                            <MenuItem value={14}>2 Weeks</MenuItem>
                                            <MenuItem value={30}>1 Month</MenuItem>
                                            <MenuItem value={90}>3 Months</MenuItem>
                                            <MenuItem value={365}>1 Year</MenuItem>
                                        </Select>
                                    </FormControl>
                                Candlestick Chart with ARK Trade Points</Typography>
                            </Grid>

                        </AccordionSummary>

                        <AccordionDetails>
                            <div className="stock-details-wrapper">
                                <StockFigure title={this.state.figureTitle.toUpperCase()} data={this.state.massagedData} isLoading={this.state.isFigureLoading} />
                            </div>
                            {/* <div className="stock-details-wrapper">
                                <StockFigure title={this.state.figureTitle.toUpperCase()} data={this.state.massagedData} isLoading={this.state.isFigureLoading} />
                            </div> */}
                        </AccordionDetails>

                    </Accordion>

                    <Accordion expanded={this.state.expanded.includes('data-grid-panel')} onChange={this.handlePanelChange('data-grid-panel')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="data-grid-panel-content"
                            id="data-grid-panel-header">

                            <Grid item xs={5} md={4}>
                                <Typography className="accordion-heading">Transactions Table</Typography>
                            </Grid>

                            <Grid item xs={7} md={4} className="second-heading-wrapper">
                                <Typography className="accordion-second-heading">All ARK Transactions from Aug 18th, 2020</Typography>
                            </Grid>

                        </AccordionSummary>

                        <AccordionDetails>
                            <DataGrid />
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
