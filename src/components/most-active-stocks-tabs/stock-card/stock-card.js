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
        this.props = props;
    }

    handleClickTicker(event) {
        tickerService.changeTicker(this.props.data.ticker);
    }

    render() {
        return (
            <div className="stock-card-wrapper">
                <Card style={{backgroundColor: this.props.backgroundColor}} onClick={this.handleClickTicker.bind(this)}>
                    <CardContent>
                        <Typography className='card-ticker'>
                            {this.props.data.ticker}
                        </Typography>
                        <Typography className='card-full-name' color="textSecondary" gutterBottom>
                            {this.props.data.name}
                        </Typography>
                        {/* <Typography className='haha' color="textSecondary">
                            adjective
                        </Typography> */}
                        <Typography className='card-details' variant="body2" component="p">
                            well meaning and kindly.
          <br />
                            {'"a benevolent smile"'}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button size="small" >View In Chart</Button>
                    </CardActions>
                </Card>
            </div>
        );
    }
};

export default StockCard;