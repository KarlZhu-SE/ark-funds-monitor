import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css';
import * as _ from 'lodash';
import { Grid } from '@material-ui/core';
import './data-grid.scss';

let rawData = require('../../rawData/mergedData.json');

Array.prototype.swapElements = function (a, b) {
    this[a] = this.splice(b, 1, this[a])[0];
    return this;
}

const toDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-")
    return new Date(year, month, day)
}

class DataGrid extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            width: window.innerWidth,
            height: window.innerHeight,
        };
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    getColumnDefs(rawData) {
        const columnDefs = [];
        const columnNamesInOrder = Object.keys(this.massageRawData(rawData)[0]).swapElements(0, 1);
        columnNamesInOrder.map(x => {
            let genericColDef = {
                key: x,
                field: x,
            };
            let specificColDef = {};
            switch (x) {
                case 'Date':
                    specificColDef = {
                        width: this.state.width / 12,
                        minWidth: 120,
                    }
                    break
                case 'Direction':
                case 'CUSIP':
                case 'Shares':
                case '% Of ETF':
                    specificColDef = {
                        width: this.state.width / 12,
                        minWidth: 100,
                    }
                    break
                case 'FUND':
                case 'Ticker':
                    specificColDef = {
                        width: this.state.width / 10,
                        minWidth: 90,
                    }
                    break
                case 'Name':
                    specificColDef = {
                        width: this.state.width / 4,
                    }
                    break
                default:
                    specificColDef = {
                        width: this.state.width / 8,
                        minWidth: 100,
                    };
                    break;
            }
            columnDefs.push(Object.assign(genericColDef, specificColDef));
        })
        return columnDefs;
    }

    massageRawData(rawData) {
        let tempData = _.cloneDeep(rawData);
        // remove empty property
        tempData.map(x => {
            for (let key in x) {
                if (key === '') {
                    delete x[key];
                }
            }
        })
        return tempData;
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    onRowClicked(e) {
        if (e && e.data && e.data.Ticker) {
            this.props.onSelectTicker(e);
        }
    }

    render() {
        const dataGridDef = {
            defaultColDef: { resizable: true, sortable: true, filter: true },
            columnDefs: this.getColumnDefs(rawData),
            rowData: this.massageRawData(rawData)
        }
        return (
            <Grid container spacing={3} justify="center" alignItems="center">
                <Grid item xs={11} className={['ag-theme-alpine-dark', 'center'].join(' ')}>
                    <AgGridReact
                        rowData={dataGridDef.rowData}
                        columnDefs={dataGridDef.columnDefs}
                        defaultColDef={dataGridDef.defaultColDef}
                        paginationAutoPageSize={true}
                        pagination={true}
                        onRowClicked={this.onRowClicked.bind(this)}
                    >
                    </AgGridReact>
                </Grid>
            </Grid>
        );
    }
};

export default DataGrid;