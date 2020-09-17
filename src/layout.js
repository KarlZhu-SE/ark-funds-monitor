import React from 'react';
import * as _ from 'lodash';
import { restClient } from "polygon.io";
import {
    Grid, Input, FormControl,
    IconButton, InputAdornment,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

import packageJson from '../package.json';
import './layout.scss';
import DataGrid from './components/data-grid/data-grid';
import StockFigure from './components/stock-figure/stock-figure';

let arkData = require('./rawData/mergedData.json');

const rest = restClient("RTHdj0YLW1JrkVcVeSQjBSHFgS4lgtCf");

class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = { inputTicker: '', massagedData: [], figureTitle: '', isInputing: false };
        this.handleChange = this.handleChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlingComposition = this.handlingComposition.bind(this);
        this.handleComposition = this.handleComposition.bind(this);
        this.onDataGridSelectTicker = this.onDataGridSelectTicker.bind(this);
        this.isCompositionEnd = true;
    }

    handlingComposition() {
        this.isCompositionEnd = false;
    }

    handleComposition(e) {
        this.isCompositionEnd = true;
    }

    handleChange(event) {
        if (this.isCompositionEnd) {
            this.setState({ inputTicker: event.target.value.trim().toUpperCase() });
        }
    }

    handleBlur(event) {
        this.isCompositionEnd = true;
    }

    handleSubmit(event) {
        // Get From/To date
        const toDate = new Date();
        let fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 60);
        const toDateString = new Date(toDate.getTime() - (toDate.getTimezoneOffset() * 60000))
            .toISOString()
            .split("T")[0];
        const fromDateString = new Date(fromDate.getTime() - (fromDate.getTimezoneOffset() * 60000))
            .toISOString()
            .split("T")[0];

        let that = this;

        rest.stocks
            .aggregates(this.state.inputTicker, 1, 'day', fromDateString, toDateString)
            .then((response) => {
                // massage response
                if (response && response.results) {
                    const massaged = [];
                    // eslint-disable-next-line
                    response.results.map(row => {
                        let rowData = [];
                        const timeInDate = new Date(row.t);
                        rowData.push(
                            new Date(timeInDate.getTime() - (timeInDate.getTimezoneOffset() * 60000))
                                .toISOString()
                                .split("T")[0],
                            row.o,
                            row.c,
                            row.l,
                            row.h,
                            row.v
                        );
                        massaged.push(rowData)
                    })
                    that.setState({ massagedData: massaged })
                    that.setState({ figureTitle: _.cloneDeep(that.state.inputTicker) })
                }
            })
            .catch(/* error handler*/)
        event.preventDefault();
    }

    onDataGridSelectTicker(e) {
        this.setState({ inputTicker: e.data.Ticker });
        this.handleSubmit(e.event);
    }

    render() {
        let subComponent;
        if (this.state.massagedData.length > 0) {
            subComponent = <StockFigure title={this.state.figureTitle.toUpperCase()} data={this.state.massagedData} />;
        } else {
            subComponent =
                <div className="chart-placeholder">
                    <p>
                        Search Any Ticker or Any Click Row
                        <br></br>
                        Candlestick Chart Will Display Below
                    </p>
                    <svg width="3em" height="3em" viewBox="0 0 16 16" class="bi bi-chevron-double-down" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" d="M1.646 6.646a.5.5 0 0 1 .708 0L8 12.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                        <path fill-rule="evenodd" d="M1.646 2.646a.5.5 0 0 1 .708 0L8 8.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                    </svg>
                </div>;
        }

        return (
            <div className="layout-wrapper">
                <div className="header-section">
                    <Grid container spacing={3} justify="center" alignItems="center">
                        <Grid item xs={6} md={10} className='title-container'>
                            <span class="logo">
                                <a href="http://IssueX.github.io/ark-funds-monitor/">
                                    <img height="90" width="120" src="https://ark-funds.com/wp-content/uploads/2020/07/ark-logo-1-1.svg" alt="ark-funds.com" title="" />
                                </a>
                            </span>
                            <span className='title'>ARK Funds Monitor</span>
                        </Grid>

                        <Grid item xs={6} md={2} className="ticker-input-section">
                            <form onSubmit={this.handleSubmit}>
                                <FormControl>
                                    <div>
                                        <Input
                                            id="ticker-textfield"
                                            value={this.state.inputTicker}
                                            onCompositionStart={this.handlingComposition}
                                            onCompositionUpdate={this.handlingComposition}
                                            onCompositionEnd={this.handleComposition}
                                            onChange={this.handleChange}
                                            onBlur={this.handleBlur}
                                            placeholder='Ticker'
                                            endAdornment={
                                                <InputAdornment position="start">
                                                    <IconButton
                                                        aria-label="Search"
                                                        onClick={this.handleSubmit}
                                                        edge="end"
                                                    >
                                                        <SearchIcon color="primary" />
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                        />
                                    </div>
                                </FormControl>
                            </form>
                        </Grid>
                    </Grid>
                </div>
                <div className="data-grid-wrapper">
                    <DataGrid onSelectTicker={this.onDataGridSelectTicker} />
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
