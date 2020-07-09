import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";

import Gallery from "../components/Gallery";

import axios from "axios";

import UserContext from '../context/UserContext';

import userIcon from "../icons/icon-user.svg";

import "./css/Profile.css"

import { useHistory } from 'react-router-dom';

import { Card, CardImg, Button, CardHeader } from 'reactstrap';


function Profile() {
    const { userData, setUserData } = useContext(UserContext);
    const [user, setUser] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const { userID } = useParams();
    const [upload, setUpload] = useState(null);
    const [isSet, setIsSet] = useState(false);
    const [isPresent, setIsPresent] = useState(false);
    const [bookmarked, setBookmarked] = useState(null);
    const [display, setDisplay] = useState(null);
    const cheatsheetObjectArray = [];

    const history = useHistory();

    const viewBookmark = () => {
        history.push(`/MyBookmark/${userID}`);
    }

    const viewUpload = () => {
        history.push(`/MyUpload/${userID}`);
    }

    useEffect(() => {
        if (userData.isLoaded && userData.token !== undefined) {
            axios
                .get(`/api/users/${userID}`)
                .then((res) => {
                    setUser(res.data);
                    setIsLoaded(true);
                })
                .catch((err) => {
                    console.log(`Fail to fetch user data: ${err}`);
                });
        }
    }, [userData, isLoaded]);

    useEffect(() => {
        axios
            .get(`/api/cheatsheets/byUser/${userID}`)
            .then((res) => {
                setUpload(res.data.slice(0, 3));
                setIsSet(true);
            })
            .catch((err) => {
                console.log(`Fail to fetch cheatsheets: ${err}`);
            });
    }, [userID]);

    useEffect(() => {
        if (user !== null) {
            setBookmarked(user.bookmarks);
        }
    }, [user])

    useEffect(() => {
        if (bookmarked !== null) {
            for (var i = 0; i < bookmarked.length; i++) {
                axios
                    .post(`/api/cheatsheets/${bookmarked[i]}`, userData.user)
                    .then((res) => {
                        cheatsheetObjectArray.push(res.data)
                        setDisplay(cheatsheetObjectArray.slice(0, 3))
                        setIsPresent(true);

                    })
                    .catch((err) => {
                        console.log(`Fail to fetch cheatsheets: ${err}`);
                    });
            }
        }
    }, [bookmarked]);

    console.log(display)
    console.log(upload)
    console.log(bookmarked)
    console.log(cheatsheetObjectArray)

    return (
        <div>
            {isLoaded
                ? <div>
                    <Card id="userCard">
                        <CardImg top width="100%" src={userIcon} alt="Card image cap" />
                        <CardHeader>{user.name}</CardHeader>
                    </Card>
                    {isSet
                        ? <div>
                            <Button color="info" id="viewUpload" onClick={viewUpload}>View All</Button>
                            <Gallery cheatsheetArray={upload} text="My Upload" dropdown="false" />
                        </div>
                        : <div></div>
                    }
                    {isPresent
                        ? <div>
                            <Button color="info" id="viewBookmark" onClick={viewBookmark}>View All</Button>
                            <Gallery cheatsheetArray={display} text="My Bookmark" dropdown="false" />
                        </div>
                        : <div></div>
                    }
                </div>
                : <div></div>
            }
        </div >

    )
}

export default Profile;