import React from 'react';
import {
    Grid, Input, FormControl,
    IconButton, InputAdornment,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

import './header.scss';
import { tickerService } from '../../services/generic-service'

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputTicker: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlingComposition = this.handlingComposition.bind(this);
        this.handleComposition = this.handleComposition.bind(this);
        this.isCompositionEnd = true;

    }

    componentDidMount() {
        this.tickerSubscription = tickerService.getTicker().subscribe(ticker => {
            if (ticker) {
                this.setState({ inputTicker: ticker });
            } else {
                this.setState({ ticker: '' });
            }
        });
    }

    componentWillUnmount() {
        this.tickerSubscription.unsubscribe();
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
        tickerService.changeTicker(this.state.inputTicker);
        event.preventDefault();
    }

    render() {
        return (
            <div className="header-section">
                <Grid container spacing={3} justify="center" alignItems="center">
                    <Grid item xs={6} md={10} className='title-container'>
                        <span className="logo">
                            <a href="http://karlzhu-se.github.io/ark-funds-monitor/">
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
        );
    }
};

export default Header;