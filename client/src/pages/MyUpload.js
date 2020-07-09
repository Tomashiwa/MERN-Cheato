import React, { useState, useEffect, useContext, useRef } from "react";

import Gallery from "../components/Gallery";

import axios from "axios";

import { useParams } from "react-router-dom";

import UserContext from '../context/UserContext';



function MyUpload() {
    const { userData, setUserData } = useContext(UserContext);
    //const [user, setUser] = useState(null);
    const [upload, setUpload] = useState(null);
    const [isLoaded,setIsLoaded] = useState(false);
    const { userID } = useParams();
    const textDisplay = "My Upload"
    const dropdownDisplay = false;

    /* useEffect(() => {
         if (userData.isLoaded && userData.token !== undefined) {
             axios
                 .get(`/api/users/${userData.user.id}`)
                 .then((res) => {
                     setUser(res.data);
                 })
                 .catch((err) => {
                     console.log(`Fail to fetch user data: ${err}`);
                 });
         }
     }, [userData]); */

    useEffect(() => {
        axios
            .get(`/api/cheatsheets/byUser/${userID}`)
            .then((res) => {
                setUpload(res.data);
                setIsLoaded(true);
            })
            .catch((err) => {
                console.log(`Fail to fetch cheatsheets: ${err}`);
            });
    }, [userID]);

    console.log(upload)

    return (
        <div>
            {(isLoaded) 
            ? <Gallery cheatsheetArray = {upload} text={textDisplay} dropdown={dropdownDisplay}/>
            : <div></div>
            }
        </div>

    )
}

export default MyUpload;