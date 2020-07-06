import React, { useState, useEffect, useContext, useRef } from "react";

import Gallery from "../components/Gallery";

import axios from "axios";

import UserContext from '../context/UserContext';

import { useParams } from "react-router-dom";



function MyBookmark() {
    const { userData, setUserData } = useContext(UserContext);
    const [user, setUser] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [bookmarked, setBookmarked] = useState(null);
    console.log(userData.user.id)
    const { userID } = useParams();
    const cheatsheetObjectArray = [];

    useEffect(() => {
        if (userData.isLoaded && userData.token !== undefined) {
            console.log("hi")
            axios
                .get(`/api/users/${userID}`)
                .then((res) => {
                    setUser(res.data);
                })
                .catch((err) => {
                    console.log(`Fail to fetch user data: ${err}`);
                });
        }
    }, [userData]);

    /*setBookmarked(user.bookmarks)
                        setIsLoaded(true);
        */
    useEffect(() => {
        if (user !== null) {
            setBookmarked(user.bookmarks)
            setIsLoaded(true);
        }
    }, [user])

    useEffect(() => {
        if (bookmarked !== null) {
            for (var i = 0; i < bookmarked.length; i++) {
                axios
                    .get(`/api/cheatsheets/byCheatsheet/${bookmarked[i]}`)
                    .then((res) => {
                        cheatsheetObjectArray.push(res)
                        console.log(cheatsheetObjectArray)
                    })
                    .catch((err) => {
                        console.log(`Fail to fetch cheatsheets: ${err}`);
                    });
            }
        }
    }, [bookmarked]);

    console.log(cheatsheetObjectArray)



    return (
        <div>
            {isLoaded
                ? <Gallery cheatsheetArray={bookmarked} />
                : <div></div>
            }
        </div>

    )
}

export default MyBookmark;