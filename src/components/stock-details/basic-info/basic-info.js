import React from 'react';
import { CircularProgress } from '@material-ui/core';

import { tickerService, errorMessageService } from '../../../services/generic-service';
import './basic-info.scss';
import * as Consts from '../../../shared/constants';

class BasicInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            ticker: '',
            showInfo: false,
            companyInfo: {
                name: '',
                ipoDate: '',
                exchange: '',
                marketCap: 0,
                shareOutstanding: 0,
                logoUrl: '',
                companyWebUrl: '',
                industry: ''
            }
        };
        this.props = props;
    }

    componentDidMount() {
        this.tickerSubscription = tickerService.getTicker().subscribe(ticker => {
            if (ticker) {
                this.setState({ ticker: ticker });
                this.getBasicInfo(ticker);
            } else {
                this.setState({ ticker: '' });
            }
        });
    }

    componentWillUnmount() {
        this.tickerSubscription.unsubscribe();
    }

    getBasicInfo(ticker) {
        errorMessageService.changeErrorMessage('');
        this.setState({ isLoading: true });

        const apiParams = {
            symbol: ticker,
            token: Consts.token
        };

        let paramsArray = [];
        for (let prop in apiParams) {
            paramsArray.push(`${prop}=${apiParams[prop]}`);
        }
        let getBasicInfoUrl = Consts.getBasicInfoUrl + paramsArray.join('&');

        fetch(getBasicInfoUrl, {
            method: 'GET'
        })
            .then(response => response.json())
            .then((data) => {
                if (data && (Object.keys(data).length !== 0 || data.constructor !== Object)) {
                    this.setState({
                        companyInfo: {
                            ...this.state.companyInfo,
                            name: data.name,
                            ipoDate: data.ipo,
                            exchange: data.exchange,
                            marketCap: data.marketCapitalization,
                            shareOutstanding: data.shareOutstanding,
                            logoUrl: data.logo,
                            companyWebUrl: data.weburl,
                            industry: data.finnhubIndustry,
                        }
                    });
                    this.setState({ showInfo: true });
                } else {
                    errorMessageService.changeErrorMessage(`API returned 'NO DATA' for ${ticker}`);
                    this.setState({ showInfo: false });
                }
                this.setState({ isLoading: false });
            })
            .catch(error => this.setState({ error }));
    }

    render() {
        let subComponent;
        if (this.state.isLoading === true) {
            subComponent =
                <div className='loader-wrapper'>
                    <CircularProgress />
                </div>
        } else if (this.state.showInfo) {
            subComponent =
                <div>
                    <p>{this.state.ticker}</p>
                    <p>{this.state.companyInfo.name}</p>
                    <a href={this.state.companyInfo.companyWebUrl}>
                        <img src={this.state.companyInfo.logoUrl} alt="Company Logo"></img>
                    </a>
                    <p>IPO Date: {this.state.companyInfo.ipoDate}</p>
                    <p>Exchange: {this.state.companyInfo.exchange}</p>
                    <p>Market Cap: {this.state.companyInfo.marketCap}</p>
                    <p>Share Outstanding: {this.state.companyInfo.shareOutstanding}</p>
                    <p>Industry: {this.state.companyInfo.industry}</p>
                </div>
        }
        return (
            <div>
                {subComponent}
            </div>
        );
    }
};

export default BasicInfo;
