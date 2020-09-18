import React from 'react';
import * as _ from 'lodash';
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
        let that = this;
        let endDate = new Date().setHours(0, 0, 0, 0) / 1000;
        let startDate = endDate - 60 * 24 * 60 * 60;
        let getCandleUrl = 'https://finnhub.io/api/v1/stock/candle?';

        const apiParams = {
            symbol: this.state.inputTicker,
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

                    // that.setState({ figureTitle: _.cloneDeep(that.state.inputTicker) });
                    that.state.figureTitle = that.state.inputTicker;
                    that.setState({ massagedData: _.cloneDeep(massaged) });
                }
            })
            .catch(error => this.setState({ error }));
        event.preventDefault();
    }

    onDataGridSelectTicker(e) {
        // this.state.inputTicker = e.data.Ticker;
        this.setState({ inputTicker: e.data.Ticker });
        this.handleSubmit(e.event);
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
                    <Grid container spacing={3} justify="center" alignItems="center">
                        <Grid item xs={6} md={10} className='title-container'>
                            <span className="logo">
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
