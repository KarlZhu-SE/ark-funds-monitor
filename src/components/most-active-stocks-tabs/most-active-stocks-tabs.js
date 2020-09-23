import React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import './most-active-stocks-tabs.scss';
import StockCard from './stock-card/stock-card';
import { daysRangeService } from '../../services/generic-service';

let arkData = require('../../rawData/mergedData.json');

class MostActiveStocksTabs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tabIndex: 0,
            // buy, sell, active colors
            tabsColor: ['#00C805', '#FF5000', '#FCAE1E'],
            tabIndicatorColor: '#00C805',
            mostActiveStocks: [],
            mostBuyStocks: [],
            mostSellStocks: []
        };
        this.props = props;
        this.handleTabChange = this.handleTabChange.bind(this);
    }

    componentDidMount() {
        this.mostActiveDaysRangeSubscription = daysRangeService.getMostActiveDaysRange().subscribe(daysRange => {
            if (daysRange) {
                this.initCardsData(arkData, daysRange);
            }
        });
    }

    componentWillUnmount() {
        this.mostActiveDaysRangeSubscription.unsubscribe();
    }

    initCardsData(arkData, daysRange) {
        // for now, check all time data
        // [{
        // ticker: 'TSLA'
        // name: Name
        // noOfSell:
        // noOfBuy:
        // noOfTransactions: number:
        // directionSymbol: []
        // transactionsDetails: []
        // }]
        let hash = {};
        let rslt = [];
        let lastestDate = arkData[0].Date;
        let deadlineTimestamp = '';

        if (daysRange !== 10000) {
            deadlineTimestamp = new Date(lastestDate).setHours(0, 0, 0, 0) - daysRange * 24 * 60 * 60 * 1000;
        }

        for (let tran of arkData) {
            // handle deadline
            if (deadlineTimestamp && new Date(tran.Date).setHours(0, 0, 0, 0) <= deadlineTimestamp) {
                break;
            }

            if (!hash[tran.Ticker]) {
                hash[tran.Ticker] = 1;
                rslt.push({
                    ticker: tran.Ticker,
                    name: tran.Name,
                    noOfSell: 0,
                    noOfBuy: 0,
                    noOfTransactions: 0,
                    directionSymbols: [],
                    transactionsDetails: []
                })
            } else {
                hash[tran.Ticker]++;
            }

            const stock = rslt.find(x => x.ticker === tran.Ticker);
            if (tran.Direction === 'Buy') {
                stock.noOfBuy++;
            } else if (tran.Direction === 'Sell') {
                stock.noOfSell++;
            }
            stock.noOfTransactions++;
            stock.directionSymbols.unshift(tran.Direction);
            stock.transactionsDetails.push(tran);
        }

        const numberOfStocks = rslt.length > 10 ? 10 : rslt.length;
        // eslint-disable-next-line
        this.state.mostBuyStocks = rslt.filter(x => x.noOfBuy > 0).sort((a, b) => b.noOfBuy - a.noOfBuy).slice(0, numberOfStocks);
        // eslint-disable-next-line
        this.state.mostSellStocks = rslt.filter(x => x.noOfSell > 0).sort((a, b) => b.noOfSell - a.noOfSell).slice(0, numberOfStocks);
        // eslint-disable-next-line
        this.state.mostActiveStocks = rslt.sort((a, b) => b.noOfTransactions - a.noOfTransactions).slice(0, numberOfStocks);
    }

    handleTabChange = (event, newTabIndex) => {
        this.setState({ tabIndex: newTabIndex });
    };

    render() {
        return (
            <div className="most-active-stocks-tabs-section">
                <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={this.state.tabIndex}
                    onChange={this.handleTabChange}
                    aria-label="Vertical tabs example"
                    TabIndicatorProps={{ style: { background: this.state.tabsColor[this.state.tabIndex] } }}
                >
                    <Tab label="Most Buy" {...a11yProps(0)} />
                    <Tab label="Most Sell" {...a11yProps(1)} />
                    <Tab label="Most Active" {...a11yProps(2)} />
                </Tabs>

                <TabPanel value={this.state.tabIndex} index={0}>
                    {this.state.mostBuyStocks.map(el =>
                        <StockCard key={el.ticker} data={el} backgroundColor={this.state.tabsColor[this.state.tabIndex]} />
                    )}
                </TabPanel>
                <TabPanel value={this.state.tabIndex} index={1}>
                    {this.state.mostSellStocks.map(el =>
                        <StockCard key={el.ticker} data={el} backgroundColor={this.state.tabsColor[this.state.tabIndex]} />
                    )}
                </TabPanel>
                <TabPanel value={this.state.tabIndex} index={2}>
                    {this.state.mostActiveStocks.map(el =>
                        <StockCard key={el.ticker} data={el} backgroundColor={this.state.tabsColor[this.state.tabIndex]} />
                    )}
                </TabPanel>
            </div>
        );
    }
};

export default MostActiveStocksTabs;

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3} className="vertical-tabpanel-content">
                    <div className="cards-wrapper">{children}</div>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}