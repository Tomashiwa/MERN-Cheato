import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";

import Gallery from "../components/Gallery";

import axios from "axios";

import UserContext from '../context/UserContext';

import userIcon from "../icons/icon-user.svg";

import "./css/Profile.css"

import Container from "reactstrap/lib/Container";

import { useHistory } from 'react-router-dom';

import { Button } from 'reactstrap';


function Profile() {
    const { userData, setUserData } = useContext(UserContext);
    
    const [user, setUser] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [upload, setUpload] = useState(null);
    const [isSet, setIsSet] = useState(false);
    const [isPresent, setIsPresent] = useState(false);
    const [bookmarked, setBookmarked] = useState(null);
    const [display, setDisplay] = useState(null);
    const [uploadText, setUploadText] = useState("");
    const [bookmarkText, setBookmarkText] = useState("");

    console.log(user)
    
    const { userID } = useParams();
    
    const cheatsheetObjectArray = [];

    const history = useHistory();

    const viewBookmark = () => {
        history.push(`/MyBookmark/${userID}`);
    }

    const viewUpload = () => {
        history.push(`/MyUpload/${userID}`);
    }

    const isUser = (userData.user.id === userID);

    useEffect(() => {
            axios
                .get(`/api/users/${userID}`)
                .then((res) => {
                    setUser(res.data);
                    setIsLoaded(true);
                    console.log(user)
                    console.log(isLoaded)
                    setUploadText(`${user.name} Upload`);
                    setBookmarkText(`${user.name} Bookmark`);
                })
                .catch((err) => {
                    console.log(`Fail to fetch user data: ${err}`);
                });
    }, [userData, isLoaded, user, userID]);

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
    }, [bookmarked,userData]);

    return (
        <div>
            <Container>
                {isLoaded
                    ? <div>
                        <img top width="250px" height="250px" src={userIcon} alt=""/>
                        <h3 id="username">{user.name}</h3>
                        {isSet
                            ? <div>
                                <Button color="info" id="viewUpload" onClick={viewUpload}>View All</Button>
                                {isUser
                                    ? <Gallery cheatsheetArray={upload} text="My Upload" dropdown="false" numbering="false"/>
                                    : <Gallery cheatsheetArray={upload} text={uploadText} dropdown="false" numbering="false"/>
                                }
                            </div>
                            : <div></div>
                        }
                        {isPresent
                            ? <div>
                                <Button color="info" id="viewBookmark" onClick={viewBookmark}>View All</Button>
                                {isUser
                                    ? <Gallery cheatsheetArray={display} text="My Bookmark" dropdown="false" numbering="false"/>
                                    : <Gallery cheatsheetArray={display} text={bookmarkText} dropdown="false" numbering="false"/>
                                }
                            </div>
                            : <div></div>
                        }
                    </div>
                    : <div></div>
                }
            </Container>
        </div >

    )
}

export default Profile;