import React from 'react';
import * as _ from 'lodash';
import { restClient } from "polygon.io";
import {
    Grid, Input, FormControl,
    InputLabel, IconButton, InputAdornment,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

import packageJson from '../package.json';
import './layout.scss';
import DataGrid from './components/data-grid/data-grid';
import StockFigure from './components/stock-figure/stock-figure';

const rest = restClient("RTHdj0YLW1JrkVcVeSQjBSHFgS4lgtCf");

class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.state = { inputTicker: '', massagedData: [], figureTitle: '' };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onDataGridSelectTicker = this.onDataGridSelectTicker.bind(this);
    }

    handleChange(event) {
        this.setState({ inputTicker: event.target.value.toUpperCase() });
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
            .catch(/* your error handler*/)
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
            subComponent = <div></div>;
        }

        return (
            <div className="layout-wrapper">
                <div className="header-section">
                    <Grid container spacing={3} justify="center" alignItems="center">
                        <Grid item xs={6} md={4} className='title-container'>
                            <h2 className='title'>Ark Funds Monitor</h2>
                        </Grid>
                        <Grid item xs={3} md={4} className='subtitle-container'>
                            <p className='subtitle-version'>Version: {packageJson.version}</p>
                            <p className='subtitle-update-date'>Last Update Date: {new Date().toJSON().slice(0,10)}</p>
                        </Grid>
                        <Grid item xs={3} md={4} className="ticker-input-section">
                            <form onSubmit={this.handleSubmit}>
                                <FormControl>
                                    <div>
                                        <Input
                                            id="ticker-textfield"
                                            value={this.state.inputTicker}
                                            onChange={this.handleChange}
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
            </div>
        );
    }
}

export default Layout;
