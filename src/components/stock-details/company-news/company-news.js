import React from 'react';
import { CircularProgress } from '@material-ui/core';

import * as Consts from '../../../shared/constants';
import { tickerService } from '../../../services/generic-service';
import { dateService } from '../../../services/date-service';
import './company-news.scss';
import NewsCard from './news-card/news-card'

class CompanyNews extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            ticker: '',
            news: []
        };
        this.props = props;
    }

    componentDidMount() {
        this.tickerSubscription = tickerService.getTicker().subscribe(ticker => {
            if (ticker) {
                this.setState({ ticker: ticker });
                this.getCompanyNews(ticker);
            } else {
                this.setState({ ticker: '' });
            }
        });
    }

    componentWillUnmount() {
        this.tickerSubscription.unsubscribe();
    }

    getCompanyNews(ticker) {
        this.setState({ isLoading: true });

        const apiParams = {
            symbol: ticker,
            from: dateService.getDateStrOfDateRange(365),
            to: dateService.getDateStrOfDateRange(0),
            token: Consts.token
        };

        let paramsArray = [];
        for (let prop in apiParams) {
            paramsArray.push(`${prop}=${apiParams[prop]}`);
        }
        let getCompanyNewsUrl = Consts.getCompanyNewsUrl + paramsArray.join('&');

        fetch(getCompanyNewsUrl, {
            method: 'GET'
        })
            .then(response => response.json())
            .then((data) => {
                if (data) {
                    this.setState({ news: data.splice(0, 9)});
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
        } else {
            subComponent =
                <div>
                    {this.state.news.map(element =>
                        <NewsCard key={element.id} newsDetails={element} />
                    )}
                </div>
        }
        return (
            <div>
                {subComponent}
            </div>
        );
    }
};

export default CompanyNews;


