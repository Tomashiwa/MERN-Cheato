import React, { useState, useContext, useRef } from 'react'
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import UserContext from '../context/UserContext';

import userIcon from "../icons/icon-user.svg";
import "./css/UserDropdown.css"
import { useHistory } from 'react-router-dom';

function UserDropdown() {
    const {userData, setUserData} = useContext(UserContext);
    const [isOpen, setIsOpen] = useState(false);

    const history = useHistory();

    const iconSizeRef = useRef(24);
    
    const toggle = () => setIsOpen(!isOpen);

    const logout = () => {
        setUserData({...userData, ...{token: undefined, user: undefined}});
        localStorage.setItem("auth-token", "");
        history.push("/");
    }

    return (
        <ButtonDropdown isOpen={isOpen} toggle={toggle} id="userdropdown">
            <DropdownToggle caret color="warning">
                <img
                    id="userdropdown-icon"
                    src={userIcon} 
                    width={`${iconSizeRef.current}px`}
                    height={`${iconSizeRef.current}px`}
                    alt="" />
                {userData.user.name}
            </DropdownToggle>
            <DropdownMenu>
                <DropdownItem>My profile</DropdownItem>
                <DropdownItem>My uploads</DropdownItem>
                <DropdownItem>My bookmarks</DropdownItem>
                <DropdownItem divider/>
                <DropdownItem onClick={logout}>Log out</DropdownItem>
            </DropdownMenu>
        </ButtonDropdown>
    )
}

export default UserDropdown
