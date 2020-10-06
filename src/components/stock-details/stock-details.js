import React from 'react';
import PropTypes from 'prop-types';
import {
    Tabs, Tab, AppBar, Box
} from '@material-ui/core';
import TimelineIcon from '@material-ui/icons/Timeline';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import CommentOutlinedIcon from '@material-ui/icons/CommentOutlined';

import './stock-details.scss';
import { tickerService } from '../../services/generic-service';
import StockFigure from './stock-figure/stock-figure'
import BasicInfo from './basic-info/basic-info'
import CompanyNews from './company-news/company-news'

class StockDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ticker: '',
            tabIndex: 0,
        };
        this.props = props;
        this.handleTabChange = this.handleTabChange.bind(this);
    }

    componentDidMount() {
        this.tickerSubscription = tickerService.getTicker().subscribe(ticker => {
            if (ticker) {
                this.setState({ ticker: ticker });
            } else {
                this.setState({ ticker: '' });
            }
        });
    }

    componentWillUnmount() {
        this.tickerSubscription.unsubscribe();
    }

    handleTabChange = (event, newTabIndex) => {
        this.setState({ tabIndex: newTabIndex });
    };

    render() {
        return (
            <div className="stock-details-inner-wrapper">
                <AppBar position="static" color="default">
                    <Tabs
                        variant="scrollable"
                        value={this.state.tabIndex}
                        onChange={this.handleTabChange}
                        TabIndicatorProps={{ style: { background: '#6200EE' } }}
                    >
                        <Tab label="Chart"  icon={<TimelineIcon />} {...a11yProps(0)} />
                        <Tab label="Basic Info" disabled={!!!this.state.ticker} icon={<InfoOutlinedIcon />}{...a11yProps(1)} />
                        <Tab label="Company News" disabled={!!!this.state.ticker} icon={<CommentOutlinedIcon />}{...a11yProps(2)} />
                    </Tabs>
                </AppBar>

                <TabPanel value={this.state.tabIndex} index={0}>
                    <StockFigure />
                </TabPanel>
                <TabPanel value={this.state.tabIndex} index={1}>
                    <BasicInfo />
                </TabPanel>
                <TabPanel value={this.state.tabIndex} index={2}>
                    <CompanyNews />
                </TabPanel>
            </div>
        );
    }
};

export default StockDetails;

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-auto-tabpanel-${index}`}
            aria-labelledby={`scrollable-auto-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    {children}
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
        id: `scrollable-auto-tab-${index}`,
        'aria-controls': `scrollable-auto-tabpanel-${index}`,
    };
}