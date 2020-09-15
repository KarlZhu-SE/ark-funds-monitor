import React from 'react';
import * as _ from 'lodash';
import { restClient } from "polygon.io";
import { TextField, Button, Input, FormControl, FormHelperText, InputLabel } from '@material-ui/core';

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
                <div className="header">
                    <div className='title'>
                        <span>Ark Funds Transactions History</span>
                    </div>

                    <div className="ticker-input-section">
                        <form onSubmit={this.handleSubmit}>
                            <FormControl>
                                <div>
                                    <InputLabel htmlFor="ticker-textfield">Ticker</InputLabel>
                                    <Input
                                        id="ticker-textfield"
                                        value={this.state.inputTicker}
                                        onChange={this.handleChange}
                                        aria-describedby="textfield-helper-text"
                                    />
                                    <Button className="submit-button" type="submit" variant="contained" color="primary">
                                        Submit
                                    </Button>
                                    <FormHelperText style={{ backgroundColor: '#fff' }} id="textfield-helper-text">Please Input Ticker to Check 60 Days Prices</FormHelperText>
                                </div>
                            </FormControl>
                        </form>
                    </div>
                </div>
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
