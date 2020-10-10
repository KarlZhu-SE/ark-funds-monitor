import React from 'react';
import * as _ from 'lodash';
import ReactEcharts from 'echarts-for-react';
import {
    CircularProgress, Grid
} from '@material-ui/core';
import { ToggleButtonGroup, ToggleButton } from '@material-ui/lab';

import * as Consts from '../../../shared/constants';
import { tickerService, errorMessageService } from '../../../services/generic-service';
import './stock-figure.scss';

let arkData = require('../../../rawData/mergedData.json');

var downColor = '#FF5000';
var downBorderColor = '#8A0000';
var upColor = '#00C805';
var upBorderColor = '#008F28';

class StockFigure extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ticker: '',
            figureTitle: '',
            candlestickDaysRange: 90,
            isFigureLoading: false,
            massagedData: [],
            figureRangeButtonConfigs: [
                { id: '1D', text: '1D', value: 1, resolution: '5', daysRange: 1 },
                { id: '1W', text: '1W', value: 7, resolution: 'D', daysRange: 7 },
                { id: '2W', text: '2W', value: 14, resolution: 'D', daysRange: 14 },
                { id: '1M', text: '1M', value: 30, resolution: 'D', daysRange: 30 },
                { id: '3M', text: '3M', value: 90, resolution: 'D', daysRange: 90 },
                { id: '1Y', text: '1Y', value: 365, resolution: 'D', daysRange: 365 }
            ]
        };
        this.props = props;
    }

    componentDidMount() {
        this.tickerSubscription = tickerService.getTicker().subscribe(ticker => {
            if (ticker) {
                this.setState({ ticker: ticker });
                this.getCandleData(ticker, this.state.candlestickDaysRange);
            } else {
                this.setState({ ticker: '' });
            }
        });
    }

    componentWillUnmount() {
        this.tickerSubscription.unsubscribe();
    }

    getCandleData(ticker, daysRange) {
        errorMessageService.changeErrorMessage('');
        this.setState({ isFigureLoading: true });


        // let that = this;
        let endDate = new Date().setHours(0, 0, 0, 0) / 1000;
        let startDate = endDate - daysRange * 24 * 60 * 60;
        let resolution = this.state.figureRangeButtonConfigs.find(x => x.value === daysRange).resolution;

        const apiParams = {
            symbol: ticker,
            resolution: resolution,
            from: startDate,
            to: endDate,
            token: Consts.token
        };
        let paramsArray = [];
        for (let prop in apiParams) {
            paramsArray.push(`${prop}=${apiParams[prop]}`);
        }
        let getCandleUrl = Consts.getCandleUrl + paramsArray.join('&');

        fetch(getCandleUrl, {
            method: 'GET'
        })
            .then(response => response.json())
            .then((data) => {
                if (data && data.s === 'ok') {
                    let massaged = [];
                    for (let i = 0; i < data.t.length; i++) {
                        let row = [];
                        let time = '';
                        if (resolution === 'D') {
                            time = new Date(data.t[i] * 1000).toISOString().split("T")[0]
                        } else if (typeof(parseInt(resolution)) === 'number') {
                            const temp = new Date(data.t[i] * 1000);
                            time = new Date(temp.setMinutes(temp.getMinutes() - 240)).toLocaleTimeString("en-US");
                        }

                        row.push(
                            time,
                            Math.round(data.o[i] * 100) / 100,
                            Math.round(data.c[i] * 100) / 100,
                            Math.round(data.l[i] * 100) / 100,
                            Math.round(data.h[i] * 100) / 100,
                            data.v[i],
                        )
                        massaged.push(row);
                    }

                    this.setState({ figureTitle: ticker });
                    this.setState({ massagedData: massaged });
                }

                if (data.s === 'no_data') {
                    errorMessageService.changeErrorMessage(`API returned 'NO DATA' for ${ticker}`);
                }

                this.setState({ isFigureLoading: false });
            })
            .catch(error => this.setState({ error }));
    }

    splitData(rawData) {
        var categoryData = [];
        var values = [];
        var volumes = [];

        for (var i = 0; i < rawData.length; i++) {
            categoryData.push(rawData[i].splice(0, 1)[0]);
            values.push(rawData[i]);
            volumes.push([i, rawData[i][4], rawData[i][0] > rawData[i][1] ? 1 : -1]);;
        }
        return {
            categoryData: categoryData,
            values: values,
            volumes: volumes
        };
    }

    calculateMA(dayCount) {
        var result = [];
        for (var i = 0, len = this.data.values.length; i < len; i++) {
            if (i < dayCount) {
                result.push('-');
                continue;
            }
            var sum = 0;
            for (var j = 0; j < dayCount; j++) {
                sum += this.data.values[i - j][1];
            }
            result.push(Math.round(sum / dayCount * 100) / 100);
        }
        return result;
    }


    getOption() {
        this.data = this.splitData(_.cloneDeep(this.state.massagedData));
        let option = {
            backgroundColor: '#fff',
            title: {
                text: this.state.figureTitle,
                left: '2%',
                top: '-1%',
                textStyle: {
                    color: '#000',
                    fontSize: 20
                },
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    animation: false,
                    type: 'cross',
                    label: {
                        fontSize: 16
                    },
                    lineStyle: {
                        color: '#376df4',
                        width: 2,
                        opacity: 1
                    }
                },
                textStyle: {
                    fontSize: 16
                }
            },
            legend: {
                data: ['Day'],
                inactiveColor: '#777',
                textStyle: {
                    color: '#000',
                    fontSize: 16
                },
                top: '3%',
            },
            axisPointer: {
                link: { xAxisIndex: 'all' },
                label: {
                    backgroundColor: '#777'
                }
            },
            toolbox: {
                show: false,
                feature: {
                    dataZoom: {
                        yAxisIndex: false
                    },
                    brush: {
                        type: ['lineX', 'clear']
                    }
                }
            },
            visualMap: {
                show: false,
                seriesIndex: 1,
                dimension: 2,
                pieces: [{
                    value: 1,
                    color: downColor
                }, {
                    value: -1,
                    color: upColor
                }]
            },
            grid: [
                {
                    bottom: '30%'
                },
                {
                    height: '15%',
                    bottom: '10%'
                }
            ],
            xAxis: [
                {
                    type: 'category',
                    data: this.data.categoryData,
                    scale: true,
                    boundaryGap: false,
                    axisLine: { onZero: false, lineStyle: { color: '#000' } },
                    splitLine: { show: false },
                    splitNumber: 20,
                    min: 'dataMin',
                    max: 'dataMax',
                    axisLabel: {
                        show: true,
                        textStyle: {
                            fontSize: 14
                        }
                    }
                },
                {
                    type: 'category',
                    gridIndex: 1,
                    data: this.data.categoryData,
                    scale: true,
                    boundaryGap: false,
                    axisLine: { onZero: false, lineStyle: { color: '#8392A5' } },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisLabel: { show: false },
                    splitNumber: 20,
                    min: 'dataMin',
                    max: 'dataMax'
                }
            ],
            yAxis: [{
                scale: true,
                splitArea: {
                    show: true
                },
                axisLine: { lineStyle: { color: '#000' } },
                splitLine: { show: false },
                axisLabel: {
                    show: true,
                    textStyle: {
                        fontSize: 14
                    }
                }
            },
            {
                scale: true,
                gridIndex: 1,
                splitNumber: 2,
                axisLabel: { show: false },
                axisLine: { show: false, lineStyle: { color: '#000' } },
                axisTick: { show: false },
                splitLine: { show: false },
            }
            ],
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 100
                },
                {
                    show: true,
                    type: 'slider',
                    bottom: '2%',
                    start: 0,
                    end: 100,
                    textStyle: {
                        color: '#8392A5'
                    },
                    handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    handleSize: '80%',
                    dataBackground: {
                        areaStyle: {
                            color: '#8392A5'
                        },
                        lineStyle: {
                            opacity: 0.8,
                            color: '#8392A5'
                        }
                    },
                    handleStyle: {
                        color: '#fff',
                        shadowBlur: 3,
                        shadowColor: 'rgba(0, 0, 0, 0.6)',
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    }
                }
            ],
            series: [
                {
                    name: 'Day',
                    type: 'candlestick',
                    data: this.data.values,
                    itemStyle: {
                        color: upColor,
                        color0: downColor,
                        borderColor: upBorderColor,
                        borderColor0: downBorderColor
                    },
                    markPoint:
                    {
                        label: {
                            normal: {
                                formatter: function (param) {
                                    if (typeof (param) === 'number') {
                                        return param != null ? Math.round(param.value) : '';
                                    }
                                }
                            }
                        },
                        data: [
                            {
                                name: 'highest value',
                                type: 'max',
                                valueDim: 'highest',
                                symbolOffset: [0, -30],
                                itemStyle: {
                                    color: '#FCAE1E'
                                }
                            },
                            {
                                name: 'lowest value',
                                type: 'min',
                                valueDim: 'lowest',
                                symbolOffset: [0, -30],
                                itemStyle: {
                                    color: '#FCAE1E'
                                }
                            },
                            // {
                            //     name: 'average value on close',
                            //     type: 'average',
                            //     valueDim: 'close',
                            //     symbolOffset: [0, -20]
                            // }
                        ],
                        tooltip: {
                            formatter: ((param) => param.name + '<br>' + (param.data.coord || ''))
                        }
                    },
                    markLine: {
                        symbol: ['none', 'none'],
                        lineStyle: {
                            color: downColor
                        },
                        data: [
                            [
                                {
                                    name: 'from lowest to highest',
                                    type: 'min',
                                    valueDim: 'lowest',
                                    symbol: 'circle',
                                    symbolSize: 10,
                                    label: {
                                        show: false
                                    },
                                    emphasis: {
                                        label: {
                                            show: false
                                        }
                                    }
                                },
                                {
                                    type: 'max',
                                    valueDim: 'highest',
                                    symbol: 'circle',
                                    symbolSize: 10,
                                    label: {
                                        show: false
                                    },
                                    emphasis: {
                                        label: {
                                            show: false
                                        }
                                    }
                                }
                            ],
                            {
                                name: 'min line on close',
                                type: 'min',
                                valueDim: 'close'
                            },
                            {
                                name: 'max line on close',
                                type: 'max',
                                valueDim: 'close'
                            }
                        ]
                    }
                },
                {
                    name: 'Volume',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: this.data.volumes
                }

            ]
        };

        // If resolution !== 'D' skip ARK history mark points and MA lines
        if (this.state.figureRangeButtonConfigs.find(x => x.value === this.state.candlestickDaysRange).resolution !== 'D') {
            return option;
        }

        // add MA lines according to candlestickDaysRange
        if (this.state.candlestickDaysRange >= 10) {
            option.series.push({
                    name: 'MA5',
                    type: 'line',
                    data: this.calculateMA(5),
                    smooth: true,
                    lineStyle: {
                        opacity: 0.5
                    },
                    itemStyle: {
                        color: '#0000FF'
                    }
            });
            option.legend.data.push('MA5');
        }
        if (this.state.candlestickDaysRange >= 20) {
            option.series.push({
                    name: 'MA10',
                    type: 'line',
                    data: this.calculateMA(10),
                    smooth: true,
                    lineStyle: {
                        opacity: 0.5
                    },
                    itemStyle: {
                        color: '#FFAE19'
                    }
            });
            option.legend.data.push('MA10');
        }
        if (this.state.candlestickDaysRange >= 40) {
            option.series.push({
                name: 'MA20',
                type: 'line',
                data: this.calculateMA(20),
                smooth: true,
                lineStyle: {
                    opacity: 0.5
                },
                itemStyle: {
                    color: '#FF00FF',
                }
            });
            option.legend.data.push('MA20');
        }

        // handle mark point for BUY/SELL from ARK
        const filteredArkData = arkData.filter(x => x.Ticker === this.state.figureTitle);
        if (!filteredArkData || filteredArkData.length === 0) {
            return option;
        }

        const groupMap = _.groupBy(filteredArkData, 'Date');
        for (let date in groupMap) {
            const dataArrayInDate = groupMap[date];
            const dataInProps = this.state.massagedData.find(m => m[0] === dataArrayInDate[0].Date);
            if (!(dataInProps && dataInProps[4])) {
                continue;
            }

            const buyCount = dataArrayInDate.filter(x => x.Direction === 'Buy').length;
            const sellCount = dataArrayInDate.length - buyCount;

            if (buyCount === 0 || sellCount === 0) {
                let pointText = '';
                if (buyCount === 0) {
                    pointText = sellCount === 1
                        ? `${dataArrayInDate[0].Direction}`
                        : `Sell\nX${sellCount}`;
                } else if (sellCount === 0) {
                    pointText = buyCount === 1
                        ? `${dataArrayInDate[0].Direction}`
                        : `Buy\nX${buyCount}`;
                }

                option.series[0].markPoint.data.push({
                    name: `${dataArrayInDate[0].Date} ${dataArrayInDate[0].Direction}`,
                    coord: [dataArrayInDate[0].Date, dataInProps[4]],
                    value: pointText,
                    itemStyle: {
                        color: buyCount === 0
                            ? '#FF5000'
                            : '#00C805'
                    }
                })
            } else {
                // have buyCount > 0 and sellCount > 0
                option.series[0].markPoint.data.push({
                    name: `${dataArrayInDate[0].Date} Buy`,
                    coord: [dataArrayInDate[0].Date, dataInProps[4]],
                    value: `Buy\nX${buyCount}`,
                    itemStyle: {
                        color: '#00C805'
                    }
                })

                option.series[0].markPoint.data.push({
                    name: `${dataArrayInDate[0].Date} Sell`,
                    coord: [dataArrayInDate[0].Date, dataInProps[4] * 1.1],
                    value: `Sell\n${sellCount}`,
                    itemStyle: {
                        color: '#FF5000'
                    }
                })
            }
        }
        return option;
    }

    handleCandlestickDaysRangeChange = (event, newValue) => {
        if (newValue !== this.state.candlestickDaysRange && this.state.massagedData.length > 0) {
            this.setState({ candlestickDaysRange: newValue });
            this.getCandleData(this.state.ticker, newValue);
        }
    };

    render() {
        let subComponent;
        if (this.state.isFigureLoading === true) {
            subComponent =
                <div className='loader-wrapper'>
                    <CircularProgress />
                </div>
        } else if (this.state.massagedData.length > 0) {
            // const fullRangePercentage = this.state.massagedData[this.state.massagedData.length - 1][2] / this.state.massagedData.data[0][2] - 1;
            // const halfRangePercentage = this.state.massagedData[this.state.massagedData.length - 1][2] / this.state.massagedData.data[Math.round((this.state.massagedData.data.length - 1) / 2)][2] - 1;

            // let fullRangeChange = (fullRangePercentage < 0 ? "" : "+") + (fullRangePercentage * 100).toFixed(2) + '%'
            // let halfRangeChange = (halfRangePercentage < 0 ? "" : "+") + (halfRangePercentage * 100).toFixed(2) + '%'

            subComponent =
                <div>
                    {/* <div className="highlights">
                        <div><p>Full range price change: {fullRangeChange}</p></div>
                        <div><p>Half range price change: {halfRangeChange}</p></div>
                    </div> */}

                    <ReactEcharts
                        option={this.getOption()}
                        notMerge={true}
                        lazyUpdate={true}
                        style={{ height: '400px', width: '100%' }}
                    />

                    <Grid container justify="center" alignItems="center">
                        <ToggleButtonGroup
                            className="toggle-button-group"
                            value={this.state.candlestickDaysRange}
                            exclusive
                            onChange={this.handleCandlestickDaysRangeChange}
                            aria-label="figure-range-button-group"
                        >
                            {this.state.figureRangeButtonConfigs.map(button =>
                                <ToggleButton key={button.id} value={button.value} aria-label={`toggle-button-${button.id}`}>{button.text}</ToggleButton>
                            )}
                        </ToggleButtonGroup>
                    </Grid>
                </div>
        } else {
            subComponent =
                <div className="chart-placeholder">
                    <p>
                        Search Any Ticker/Tap Any Card/Tap Any Row
                        <br></br>
                        Candlestick Chart Will Display Below
                    </p>
                    <svg width="3em" height="3em" viewBox="0 0 16 16" className="bi bi-chevron-double-down" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.646 6.646a.5.5 0 0 1 .708 0L8 12.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                        <path d="M1.646 2.646a.5.5 0 0 1 .708 0L8 8.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                    </svg>
                </div>
        }

        return (
            <div>
                {subComponent}
            </div>
        )
    }
}

export default StockFigure;