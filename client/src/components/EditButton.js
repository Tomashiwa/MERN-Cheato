import React from 'react'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

import "./css/EditButton.css"

function EditButton({sheet}) {
    const history = useHistory();

    const goEdit = () => {
		history.push(`/edit/${sheet.id}`);
    }
    
    return (
        <button id="editbtn" type="button" onClick={goEdit}>
            <div id="editbtn-icon"></div>
        </button>
    )
}

export default EditButton
