import React from 'react';
import moment from 'moment';

// Date cell headers with day of week
const DateHeaderRenderer = (props) => {
    const date = moment(props.column.colId, 'D').date(props.column.colId);
    const dayName = date.format('ddd');
    const isWeekend = dayName === 'Sat' || dayName === 'Sun';
    
    return (
        <div className={`text-center flex flex-col items-center ${isWeekend ? 'text-red-500' : ''}`}>
            <span className="text-xs font-semibold">{dayName}</span>
            <span className="text-sm">{props.column.colId}</span>
        </div>
    );
};

export default DateHeaderRenderer; 