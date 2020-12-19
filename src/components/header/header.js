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
                        {/* <span className="logo">
                            <a href="http://karlzhu-se.github.io/ark-funds-monitor/">
                                <img height="90" width="120" src="https://ark-funds.com/wp-content/uploads/2020/07/ark-logo-1-1.svg" alt="ark-funds.com" title="" />
                            </a>
                        </span> */}
                        <a className='title' href="http://karlzhu-se.github.io/ark-funds-monitor/">
                            <span>ARK Funds Monitor</span>
                        </a>
                        {/* <div className="github-section">
                            <span>View it on</span>
                            <a className="github-icon" href="https://github.com/KarlZhu-SE/ark-funds-monitor" target="_blank" rel="noopener noreferrer" aria-label="Github">
                                <svg height="24" viewBox="0 0 16 16" version="1.1" width="24" aria-hidden="true"><path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
                            </a>
                        </div> */}
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