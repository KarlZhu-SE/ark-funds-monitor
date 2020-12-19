import React from 'react';
import {
    Accordion, Grid, AccordionDetails, AccordionSummary,
    Typography, MenuItem, FormControl, Select, Button
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Alert from '@material-ui/lab/Alert';

import packageJson from '../package.json';
import './layout.scss';
import { tickerService, daysRangeService, errorMessageService } from './services/generic-service';
import Header from './components/header/header';
import MostActiveStocksTabs from './components/most-active-stocks-tabs/most-active-stocks-tabs';
import DataGrid from './components/data-grid/data-grid';
import StockDetails from './components/stock-details/stock-details';

let arkData = require('./rawData/mergedData.json');

class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: ['most-active-stock-panel'],
            mostActiveDaysRange: 7,
            errorMessage: '',
            isInputing: false
        };

        this.handlePanelChange = this.handlePanelChange.bind(this);
        this.handleClickDaysRange = this.handleClickDaysRange.bind(this);
        this.handleSelectDaysRange = this.handleSelectDaysRange.bind(this);
        this.handleDonationSectionClick = this.handleDonationSectionClick.bind(this);

        this.coffeeEmoji = React.createRef();
    }

    componentDidMount() {
        this.tickerSubscription = tickerService.getTicker().subscribe(ticker => {
            if (ticker) {
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

        this.errorMessageSubscription = errorMessageService.getErrorMessage().subscribe(message => {
            if (message) {
                this.setState({ errorMessage: message });
            } else {
                this.setState({ errorMessage: '' });
            }
        });
    }

    componentWillUnmount() {
        this.tickerSubscription.unsubscribe();
        this.mostActiveDaysRangeSubscription.unsubscribe();
        this.errorMessageSubscription.unsubscribe();
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
            default:
                break;
        }
    }

    handleDonationSectionClick() {
        console.log(this.coffeeEmoji)
        this.coffeeEmoji.current.click();
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
                                    Top 10 Most Active Stocks in
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
                                            <MenuItem value={10000}>From 11/12/2019</MenuItem>
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
                                {/* <Typography className="accordion-second-heading" component={'span'}>
                                Chart with ARK Trade History</Typography> */}
                            </Grid>

                        </AccordionSummary>

                        <AccordionDetails>
                            <div className="stock-details-wrapper">
                                <StockDetails />
                            </div>
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
                                <Typography className="accordion-second-heading">All ARK Transactions</Typography>
                            </Grid>

                        </AccordionSummary>

                        <AccordionDetails>
                            <DataGrid />
                        </AccordionDetails>

                    </Accordion>

                </div>

                <Grid container className="sticky-footer">

                    <Grid item xs={3} md={3}>
                        <p className="disclaimer">Disclaimer: This web is built for education only.<br></br>The author takes no responsibility for financial decisions.</p>
                    </Grid>

                    <Grid item xs={6} md={6} className="donation-section">
                        <div className="donation" onClick={this.handleDonationSectionClick}>
                            <form action="https://www.paypal.com/donate" method="post" target="_top">
                                <input type="hidden" name="cmd" value="_donations" />
                                <input type="hidden" name="business" value="xzhu@wpi.edu" />
                                <input type="hidden" name="currency_code" value="USD" />
                                <Button size="small" variant="contained" color="primary" className="emoji-submit-button" type="submit" ref={this.coffeeEmoji}>
                                    <span name="submit" role="img" aria-label="coffee">Like this? Pls buy me a coffee~☕</span>
                                </Button>
                                <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
                            </form>
                        </div>
                    </Grid>

                    <Grid item xs={3} md={3}>
                        <div className='info-container'>
                            <p className='info-version'>Version: {packageJson.version}</p>
                            <p className='info-update-date'>Latest ARK Data: {arkData[0]['Date']}</p>
                        </div>
                    </Grid>
                </Grid>

            </div>
        );
    }
}

export default Layout;
