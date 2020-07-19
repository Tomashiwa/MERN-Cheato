import React, { useState, useEffect, useContext } from "react";

import Gallery from "../components/Gallery";

import axios from "axios";

import { useParams } from "react-router-dom";

import UserContext from '../context/UserContext';

function MyUpload() {
    const { userData, setUserData } = useContext(UserContext);

    const [user, setUser] = useState(null);
    const [upload, setUpload] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [uploadText, setUploadText] = useState("");

    const { userID } = useParams();

    const textDisplay = "My Upload"
    const dropdownDisplay = false;

    const isUser = (userData.user.id === userID);

    useEffect(() => {
        if (userData.isLoaded && userData.token !== undefined) {
            axios
                .get(`/api/users/${userID}`)
                .then((res) => {
                    setUser(res.data);
                    setUploadText(`${res.data.name} Upload`);
                })
                .catch((err) => {
                    console.log(`Fail to fetch user data: ${err}`);
                });
        }
    }, [userData,userID]);

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

    console.log(user)

    return (
        <div>
            {(isLoaded)
                ? <div>
                    {isUser
                        ? <Gallery cheatsheetArray={upload} text={textDisplay} dropdown={dropdownDisplay} />
                        : <Gallery cheatsheetArray={upload} text={uploadText} dropdown={dropdownDisplay} />
                    }
                </div>
                : <div></div>
            }
        </div>

    )
}

export default MyUpload;