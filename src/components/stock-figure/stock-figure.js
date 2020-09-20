import React from 'react';
import * as _ from 'lodash';
import './stock-figure.scss';
import ReactEcharts from 'echarts-for-react';

let arkData = require('../../rawData/mergedData.json');

var downColor = '#FF5000';
var downBorderColor = '#8A0000';
var upColor = '#00C805';
var upBorderColor = '#008F28';

class StockFigure extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: '' };
        this.props = props;
    }

    shouldComponentUpdate(nextProps) {
        return this.props.data !== nextProps.data;
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
        this.data = this.splitData(_.cloneDeep(this.props.data));
        // console.log(this.data)
        let option = {
            backgroundColor: '#fff',
            title: {
                text: this.props.title,
                left: '5%',
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
                data: ['Day', 'MA5', 'MA10', 'MA20'],
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
                seriesIndex: 4,
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
                    left: '5%',
                    right: '5%',
                    bottom: '30%'
                },
                {
                    left: '5%',
                    right: '5%',
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
                            fontSize: 16
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
                        fontSize: 16
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
                                symbolOffset: [0, -20]
                            },
                            {
                                name: 'lowest value',
                                type: 'min',
                                valueDim: 'lowest',
                                symbolOffset: [0, -20]
                            },
                            {
                                name: 'average value on close',
                                type: 'average',
                                valueDim: 'close',
                                symbolOffset: [0, -20]
                            }
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
                },
                {
                    name: 'MA10',
                    type: 'line',
                    data: this.calculateMA(10),
                    smooth: true,
                    lineStyle: {
                        opacity: 0.5
                    },
                    itemStyle: {
                        color: '#FFAE19',
                    }
                },
                {
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
                },
                // {
                //     name: 'MA30',
                //     type: 'line',
                //     data: this.calculateMA(30),
                //     smooth: true,
                //     lineStyle: {
                //         opacity: 0.5
                //     }
                // },
                {
                    name: 'Volume',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: this.data.volumes
                }

            ]
        };

        // handle mark point for BUY/SELL from ARK
        const filteredArkData = arkData.filter(x => x.Ticker === this.props.title);
        if (!filteredArkData || filteredArkData.length === 0) {
            return option;
        }

        const groupMap = _.groupBy(filteredArkData, 'Date');
        for (let date in groupMap) {
            const dataArrayInDate = groupMap[date];
            const dataInProps = this.props.data.find(m => m[0] === dataArrayInDate[0].Date);
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

    render() {
        let subComponent;
        if (this.props.data.length > 0) {
            const sixtyDaysPercentage = this.props.data[this.props.data.length - 1][2] / this.props.data[0][2] - 1;
            const thirtyDaysPercentage = this.props.data[this.props.data.length - 1][2] / this.props.data[Math.round((this.props.data.length - 1) / 2)][2] - 1;
                    
            let sixtyPerf = (sixtyDaysPercentage < 0 ? "" : "+") + (sixtyDaysPercentage * 100).toFixed(2) + '%'
            let thirtyPerf = (thirtyDaysPercentage < 0 ? "" : "+") + (thirtyDaysPercentage * 100).toFixed(2) + '%'

            subComponent =
                <div>
                    <div className="highlights">
                        <p>Last 30 days performance: {thirtyPerf}</p>
                        <p>Last 60 days performance: {sixtyPerf}</p>
                    </div>
                    <ReactEcharts
                        option={this.getOption()}
                        notMerge={true}
                        lazyUpdate={true}
                        style={{ height: '500px', width: '100%' }}
                    />
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