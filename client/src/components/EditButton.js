import React, { useState, useRef } from 'react'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

import Tooltip from "reactstrap/lib/Tooltip";

import "./css/EditButton.css"

function EditButton({sheet}) {
    const [isHovered, setIsHovered] = useState(false);
    const history = useHistory();

    const btnRef = useRef(null);

	const toggleHover = () => setIsHovered(!isHovered);

    const goEdit = () => {
		history.push(`/edit/${sheet.id}`);
    }
    
    return (
        <>
            <button id="editbtn" ref={btnRef} type="button" onClick={goEdit}>
                <div id="editbtn-icon"></div>
            </button>
            <Tooltip
				target={btnRef}
				placement="right"
				isOpen={isHovered}
				autohide={false}
				toggle={toggleHover}
			> 
				Edit
			</Tooltip>
        </>
    )
}

export default EditButton
