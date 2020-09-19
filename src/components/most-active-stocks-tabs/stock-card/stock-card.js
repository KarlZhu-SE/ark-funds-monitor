import React from 'react';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import './stock-card.scss';
import { tickerService } from '../../../services/ticker-service';

class StockCard extends React.Component {
    constructor(props) {
        super(props);
        // this.state = {
        //     inputTicker: ''
        // };
        this.props = props;
    }

    handleClickTicker(event) {
        tickerService.changeTicker(this.props.data.ticker);
    }

    render() {
        return (
            <div className="stock-card-wrapper">
                <Card>
                    <CardContent>
                    <Typography className='card-ticker' onClick={this.handleClickTicker.bind(this)}>
                            {this.props.data.ticker}
                        </Typography>
                        <Typography className='card-full-name' color="textSecondary" gutterBottom>
                            {this.props.data.name}
                        </Typography>
                        {/* <Typography className='haha' color="textSecondary">
                            adjective
                        </Typography> */}
                        <Typography variant="body2" component="p">
                            well meaning and kindly.
          <br />
                            {'"a benevolent smile"'}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button size="small">Learn More</Button>
                    </CardActions>
                </Card>
            </div>
        );
    }
};

export default StockCard;