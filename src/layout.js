import React from 'react';

import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

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
            daysRange: 30,
            inputTicker: '',
            massagedData: [],
            figureTitle: '',
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
        return (
            <div className="layout-wrapper">
                <div className="header-wrapper">
                    <Header />
                </div>
                <div className="accordion-wrapper">
                    <Accordion expanded={this.state.expanded.includes('most-active-stock-panel')} onChange={this.handlePanelChange('most-active-stock-panel')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="most-active-stock-panel-content"
                            id="most-active-stock-panel-header">
                            <Typography className="accordion-heading">Most Active Stocks</Typography>
                            <Typography className="accordion-second-heading" component={'span'}>
                                Top 5 Most Active Stocks ARK Trades in 
                                <FormControl className="days-dropdown">
                                    <Select
                                        labelId="demo-simple-select-placeholder-label-label"
                                        id="demo-simple-select-placeholder-label"
                                        value={this.state.daysRange}
                                        onClick={this.handleClickDaysRange.bind(this)}
                                        onChange={this.handleSelectDaysRange.bind(this)}
                                        MenuProps={{ disableScrollLock: true }}
                                    >
                                        <MenuItem value={5}>5</MenuItem>
                                        <MenuItem value={10}>10</MenuItem>
                                        <MenuItem value={20}>20</MenuItem>
                                        <MenuItem value={30}>30</MenuItem>
                                        <MenuItem value={60}>60</MenuItem>
                                        <MenuItem value={10000}>All</MenuItem>
                                    </Select>
                                </FormControl> days.
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
                            <Typography className="accordion-second-heading">Includes All ARK Trades from Aug 18th, 2020</Typography>
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
                            <Typography className="accordion-second-heading">60 Days Candlestick Chart with ARK Trade Points</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div className="stock-figure-wrapper">
                                <StockFigure title={this.state.figureTitle.toUpperCase()} data={this.state.massagedData} />
                            </div>
                        </AccordionDetails>
                    </Accordion>
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
