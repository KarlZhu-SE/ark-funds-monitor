import React, { useState } from 'react';
import {AgGridColumn, AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const App = () => {
    // eslint-disable-next-line
    const [gridApi, setGridApi] = useState(null);
    // eslint-disable-next-line
    const [gridColumnApi, setGridColumnApi] = useState(null);

    // eslint-disable-next-line
    const [rowData, setRowData] = useState([
        {make: "Toyota", model: "Celica", price: 35000},
        {make: "Ford", model: "Mondeo", price: 32000},
        {make: "Porsche", model: "Boxter", price: 72000}
    ]);

    return (
        <div className="ag-theme-alpine" style={ {height: '200px', width: '600px'} }>
            <AgGridReact
                rowData={rowData}>
                <AgGridColumn field="make"></AgGridColumn>
                <AgGridColumn field="model"></AgGridColumn>
                <AgGridColumn field="price"></AgGridColumn>
            </AgGridReact>
        </div>
    );
};

export default App;