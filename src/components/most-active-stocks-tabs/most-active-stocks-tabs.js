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
            mostActiveStocks: [],
            mostBuyStocks: [],
            mostSellStocks: []
        };
        this.props = props;
        this.handleTabChange = this.handleTabChange.bind(this);
    }

    componentDidMount() {
        this.daysRangeSubscription = daysRangeService.getDaysRange().subscribe(daysRange => {
            if (daysRange) {
                console.log(daysRange)
                this.initCardsData(arkData, daysRange);
            }
        });
    }

    componentWillUnmount() {
        this.daysRangeSubscription.unsubscribe();
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

        let dateString = '';
        if (daysRange !== 10000) {
            const deadlineDate = new Date().setHours(0, 0, 0, 0) / 1000 - daysRange * 24 * 60 * 60;
            dateString = new Date(deadlineDate * 1000).toISOString().split("T")[0];
        }

        for (let tran of arkData) {
            if (dateString && dateString === tran.Date) {
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

        const numberOfStocks = 5;
        // eslint-disable-next-line
        this.state.mostActiveStocks = rslt.sort((a, b) => b.noOfTransactions - a.noOfTransactions).splice(0, numberOfStocks);
        // eslint-disable-next-line
        this.state.mostBuyStocks = rslt.sort((a, b) => b.noOfBuy - a.noOfBuy).splice(0, numberOfStocks);
        // eslint-disable-next-line
        this.state.mostSellStocks = rslt.sort((a, b) => b.noOfSell - a.noOfSell).splice(0, numberOfStocks);
    }

    handleTabChange = (event, newTabIndex) => {
        this.setState({ tabIndex: newTabIndex })
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
                >
                    <Tab label="Most Active" {...a11yProps(0)} />
                    <Tab label="Most Buy" {...a11yProps(1)} />
                    <Tab label="Most Sell" {...a11yProps(2)} />
                </Tabs>
                <TabPanel value={this.state.tabIndex} index={0}>
                    {this.state.mostActiveStocks.map(el =>
                        <StockCard key={el.ticker} data={el} backgroundColor={'#FCAE1E'}/>
                    )}
                </TabPanel>
                <TabPanel value={this.state.tabIndex} index={1}>
                    {this.state.mostBuyStocks.map(el =>
                        <StockCard key={el.ticker} data={el} backgroundColor={'#00C805'}/>
                    )}
                </TabPanel>
                <TabPanel value={this.state.tabIndex} index={2}>
                    {this.state.mostSellStocks.map(el =>
                        <StockCard key={el.ticker} data={el} backgroundColor={'#FF5000'}/>
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