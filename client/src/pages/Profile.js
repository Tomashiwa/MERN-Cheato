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
    const { userData } = useContext(UserContext);

    const [user, setUser] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [upload, setUpload] = useState(null);
    const [isSet, setIsSet] = useState(false);
    const [isPresent, setIsPresent] = useState(false);
    const [bookmarked, setBookmarked] = useState(null);
    const [display, setDisplay] = useState(null);
    const [uploadText, setUploadText] = useState("");
    const [bookmarkText, setBookmarkText] = useState("");

    const { userID } = useParams();

    const history = useHistory();

    const viewBookmark = () => {
        history.push(`/MyBookmark/${userID}`);
    }

    const viewUpload = () => {
        history.push(`/MyUpload/${userID}`);
    }

    useEffect(() => {
        axios
            .get(`/api/users/${userID}`)
            .then((res) => {
                setUser(res.data);
                setIsLoaded(true);
                setUploadText(`${user.name} Upload`);
                setBookmarkText(`${user.name} Bookmark`);
            })
            .catch((err) => {
                console.log(`Fail to fetch user data: ${err}`);
            });
    }, [userData, isLoaded, userID]);

    useEffect(() => {
        axios
            .get(`/api/cheatsheets/byUser/${userID}`)
            .then((res) => {
                setUpload(res.data.slice(0, 3));
                setIsSet(true);
                console.log(upload)
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
            console.log(bookmarked)
            Promise.all(bookmarked.map(bookmark =>
                axios
                    .post(`/api/cheatsheets/${bookmark}`, userData.user)))
                .then(results => {
                    let arr = [];
                    results.forEach(result => {
                        arr.push(result.data);
                    })
                    setDisplay(arr.slice(0, 3));
                    setIsPresent(true);
                    console.log(display)
                })
        }
    }, [bookmarked, userData]);

    return (
        <div>
            <Container>
                {isLoaded
                    ? <div>
                        <img top width="250px" height="250px" src={userIcon} alt="" />
                        <h3 id="username">{user.name}</h3>
                        {upload !== null
                            ? <div>{isSet
                                ? <div>
                                    <Button color="info" id="viewUpload" onClick={viewUpload}>View All</Button>
                                    {(userData.user && (userData.user.id === userID))
                                        ? <Gallery cheatsheetArray={upload} text="My Upload" dropdown="false" numbering="false" />
                                        : <Gallery cheatsheetArray={upload} text={uploadText} dropdown="false" numbering="false" />
                                    }
                                </div>
                                : <div></div>
                            }</div>
                            : <p>You have not uploaded any cheatsheets yet</p>
                        }
                        {display !== null
                            ? <div>{isPresent
                                ? <div>
                                    <Button color="info" id="viewBookmark" onClick={viewBookmark}>View All</Button>
                                    {(userData.user && (userData.user.id === userID))
                                        ? <Gallery cheatsheetArray={display} text="My Bookmark" dropdown="false" numbering="false" />
                                        : <Gallery cheatsheetArray={display} text={bookmarkText} dropdown="false" numbering="false" />
                                    }
                                </div>
                                : <div></div>
                            }</div>
                            : <p>You have not bookmarked any cheatsheets yet</p>
                        }</div>
                    : <div></div>
                }
            </Container>
        </div >

    )
}

export default Profile;