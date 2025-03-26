// Cell renderer for student name with defensive coding
const StudentNameRenderer = (props) => {
    // Make sure we're handling all possible edge cases
    const name = props.value ? String(props.value) : '-';
    const departmentName = props.data && props.data.departmentName ? String(props.data.departmentName) : '';
    
    return (
        <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            {departmentName && (
                <span className="text-xs text-gray-500">{departmentName}</span>
            )}
        </div>
    );
};

export default StudentNameRenderer; 