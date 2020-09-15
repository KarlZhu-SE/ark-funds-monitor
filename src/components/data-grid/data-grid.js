import React, { useState } from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import * as _ from 'lodash';

import './data-grid.css';

let rawData = require('../../rawData/mergedData.json');

Array.prototype.swapElements = function (a, b) {
    this[a] = this.splice(b, 1, this[a])[0];
    return this;
}

const massageRawData = (rawData) => {
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

const toDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-")
    return new Date(year, month, day)
}

const DataGrid = () => {
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState(massageRawData(rawData));

    const columns = Object.keys(rowData[0]).swapElements(0, 1);

    const onCellClick = e => {
        console.log('in')
        const selectedNodes = gridApi.getSelectedNodes()
        const selectedData = selectedNodes.map(node => node.data)
        const selectedDataStringPresentation = selectedData.map(node => node.make + ' ' + node.model).join(', ')
        alert(`Selected nodes: ${selectedDataStringPresentation}`)
    }

    return (
        <div className={['ag-theme-alpine', 'center'].join(' ')}>
            <AgGridReact
                rowData={rowData}
                cellClicked={onCellClick}>
                {columns.map(column => (
                    <AgGridColumn key={column} field={column} width={170} sortable={true} filter={true}></AgGridColumn>
                ))}
            </AgGridReact>
        </div>
    );
};

export default DataGrid;