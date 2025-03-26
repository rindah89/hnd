// Cell renderer for student ID with defensive coding
const StudentIdRenderer = (props) => {
    // Make sure we're handling all possible edge cases
    const id = props.value ? String(props.value) : '-';
    const matricule = props.data && props.data.matricule ? String(props.data.matricule) : '';
    
    return (
        <div className="flex flex-col">
            <span className="font-medium text-gray-700">#{id}</span>
            {matricule && (
                <span className="text-xs text-gray-500">Mat: {matricule}</span>
            )}
        </div>
    );
};

export default StudentIdRenderer; 