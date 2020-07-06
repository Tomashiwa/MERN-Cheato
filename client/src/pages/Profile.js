import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";

import Gallery from "../components/Gallery";

import axios from "axios";

import UserContext from '../context/UserContext';

import userIcon from "../icons/icon-user.svg";

function Profile() {
    const { userData, setUserData } = useContext(UserContext);
    const [user, setUser] = useState(null);
    const { userID } = useParams();

    useEffect(() => {
        if (userData.isLoaded && userData.token !== undefined) {
            axios
                .get(`/api/user/${userID}`)
                .then((res) => {
                    setUser(res.data);
                })
                .catch((err) => {
                    console.log(`Fail to fetch user data: ${err}`);
                });
        }
    }, [userData]);


    return (
        <div>
            <img
                    id="userdropdown-icon"
                    src={userIcon} 
                    width="250px"
                    height="400px"
                    alt="" />
            <Gallery />
        </div>

    )
}

export default Profile;