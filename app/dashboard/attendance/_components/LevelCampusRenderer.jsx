// Cell renderer for level and campus with defensive coding
const LevelCampusRenderer = (props) => {
    // Make sure we're always rendering a string for the level value
    let levelValue = '';
    
    // Check what type of value we're dealing with
    if (props.value === null || props.value === undefined) {
        levelValue = '-';
    } else if (typeof props.value === 'object') {
        // If it's an object, try to extract the level property or stringify it
        levelValue = props.value.level || JSON.stringify(props.value);
    } else {
        // Convert any other type to string
        levelValue = String(props.value);
    }
    
    // Safely extract campus name
    const campusName = props.data && props.data.campusName ? String(props.data.campusName) : '';
    
    return (
        <div className="flex flex-col">
            <span className="font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs inline-block">{levelValue}</span>
            {campusName && (
                <span className="text-xs text-gray-500 mt-1">{campusName}</span>
            )}
        </div>
    );
};

export default LevelCampusRenderer; 