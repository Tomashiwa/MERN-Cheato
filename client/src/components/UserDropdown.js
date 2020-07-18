import React, { useState, useContext, useRef } from 'react'
import { useHistory } from 'react-router-dom';

import ButtonDropdown from "reactstrap/lib/ButtonDropdown";
import DropdownToggle from "reactstrap/lib/DropdownToggle";
import DropdownMenu from "reactstrap/lib/DropdownMenu";
import DropdownItem from "reactstrap/lib/DropdownItem";

import UserContext from '../context/UserContext';
import "./css/UserDropdown.css"

const URL_HOME = process.env.NODE_ENV !== "production"
    ? "http://localhost:3000/"
    : "https://cheato.herokuapp.com/";
const URL_USERICON = "https://d2conugba1evp1.cloudfront.net/icons/icon-user.svg";

function UserDropdown() {
    const {userData, setUserData} = useContext(UserContext);
    const [isOpen, setIsOpen] = useState(false);

    const history = useHistory();

    const iconSizeRef = useRef(24);
    
    const toggle = () => setIsOpen(!isOpen);

    const logout = () => {
        setUserData({...userData, ...{token: undefined, user: undefined}});
        localStorage.setItem("auth-token", "");

        if(URL_HOME === (window.location.href)) {
            window.location.reload();
        } else {
            history.push("/");
        }
    }

    const viewProfile = () => {
        history.push(`/profile/${userData.user.id}`);
    }

    const viewBookmarked = () => {
        history.push(`/MyBookmark/${userData.user.id}`);
    }

    const viewUpload = () => {
        history.push(`/MyUpload/${userData.user.id}`);
    }

    return (
        <ButtonDropdown isOpen={isOpen} toggle={toggle} id="userdropdown">
            <DropdownToggle caret color="warning">
                <img
                    id="userdropdown-icon"
                    src={URL_USERICON} 
                    width={`${iconSizeRef.current}px`}
                    height={`${iconSizeRef.current}px`}
                    alt="" />
                {userData.user.name}
            </DropdownToggle>
            <DropdownMenu>
                <DropdownItem onClick={viewProfile}>My profile</DropdownItem>
                <DropdownItem onClick ={viewUpload}>My uploads</DropdownItem>
                <DropdownItem onClick={viewBookmarked}>My bookmarks</DropdownItem>
                <DropdownItem divider/>
                <DropdownItem onClick={logout}>Log out</DropdownItem>
            </DropdownMenu>
        </ButtonDropdown>
    )
}

export default UserDropdown
