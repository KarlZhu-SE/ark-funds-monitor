import React from 'react';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import './news-card.scss';
import { dateService } from '../../../../services/date-service';

class NewsCard extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    handleClickNews(event) {
        window.location.href = this.props.newsDetails.url;
    }

    render() {
        const MAX_LENGTH = 300;

        return (
            <div className="news-card-wrapper">
                <Card onClick={this.handleClickNews.bind(this)}>
                    <CardContent>
                        <Typography className='card-headline'>
                            {this.props.newsDetails.headline}
                        </Typography>
                        <Typography className='card-time-source' color="textSecondary" gutterBottom>
                            {dateService.timeSince(this.props.newsDetails.datetime) + '   ' + this.props.newsDetails.source}
                        </Typography>
                        <Typography className='card-details' variant="body2" component="span">
                            {this.props.newsDetails.summary.length > MAX_LENGTH ?
                                (
                                    <div>
                                        {`${this.props.newsDetails.summary.substring(0, MAX_LENGTH)}...`}<a href={this.props.newsDetails.url}>Read more</a>
                                    </div>
                                ) :
                                <p>{this.props.newsDetails.summary}</p>
                            }
                        </Typography>
                    </CardContent>
                </Card>
            </div>
        );
    }
};

export default NewsCard;
