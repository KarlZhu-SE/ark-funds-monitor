import React from 'react';
import * as _ from 'lodash';
import { restClient } from "polygon.io";
import {
    Grid, Button, Input, FormControl,
    FormHelperText, InputLabel, OutlinedInput,
    IconButton, InputAdornment
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

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
    }

    handleChange(event) {
        this.setState({ inputTicker: event.target.value });
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

    render() {
        let subComponent;
        if (this.state.massagedData.length > 0) {
            subComponent = <StockFigure title={this.state.figureTitle.toUpperCase()} data={this.state.massagedData} />;
        } else {
            subComponent = <div></div>;
        }

        return (
            <div className="layout-wrapper">
                <Grid container spacing={3} justify="center" alignItems="center" className="header">
                    <Grid item xs={3} md={4}>
                    </Grid>
                    <Grid item xs={6} md={4} className='title'>
                        <span>Ark Funds Transactions History</span>
                    </Grid>
                    <Grid item xs={3} md={4} className="ticker-input-section">
                        <form onSubmit={this.handleSubmit}>
                            <FormControl>
                                <div>
                                    <InputLabel htmlFor="ticker-textfield">Ticker</InputLabel>
                                    <Input
                                        id="ticker-textfield"
                                        value={this.state.inputTicker}
                                        onChange={this.handleChange}
                                        endAdornment={
                                            <InputAdornment position="start">
                                                <IconButton
                                                    aria-label="Search"
                                                    onClick={this.handleSubmit}
                                                    edge="end"
                                                >
                                                    <SearchIcon color="primary"/>
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                    />
                                </div>
                            </FormControl>
                            {/* <FormControl variant="outlined">
                                <InputLabel htmlFor="outlined-ticker-textfield">Ticker</InputLabel>
                                <OutlinedInput
                                    style={{backgroundColor: '#fff'}}
                                    id="outlined-ticker-textfield"
                                    type='text'
                                    value={this.state.inputTicker}
                                    onChange={this.handleChange}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="Search"
                                                onClick={this.handleSubmit}
                                                edge="end"
                                            >
                                                <SearchIcon color="primary"/>
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    labelWidth={70}
                                />
                            </FormControl> */}
                        </form>
                    </Grid>
                </Grid>
                <div className="data-grid-wrapper">
                    <DataGrid />
                </div>
                <div className="stock-figure-wrapper">
                    {subComponent}
                </div>
            </div>
        );
    }
}

export default Layout;
