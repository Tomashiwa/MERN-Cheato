import React, { useEffect, useState, useContext } from 'react'
import { useHistory } from 'react-router-dom';

import axios from 'axios';
import UserContext from "../context/UserContext";

import Rating from "../components/Rating";
import BookmarkButton from "../components/BookmarkButton";

import {
    Card, CardImg, Button, CardHeader
} from 'reactstrap';



// import similarIcon from "../icons/icon-similar.svg";
// import authorIcon from "../icons/icon-author.svg";
// import viewIcon from "../icons/icon-view.svg";
// import upvoteIcon from "../icons/icon-upvote.svg";
// import downvoteIcon from "../icons/icon-downvote.svg";
// import bookmarkIcon from "../icons/icon-bookmark.svg";
import "./css/CheatsheetCard.css"

function CheatsheetCard({ sheet }) {
    var [vote, setVote] = useState(sheet.rating);
    const [user, setUser] = useState(null);
    const { userData } = useContext(UserContext);
    const [name, setName] = useState("");
    const [nameLoaded, setNameLoaded] = useState(false);
    const isLoggedin = userData.isLoaded && userData.token !== undefined

    const history = useHistory();

    const viewCheatsheet = () => {
        history.push(`/view/${sheet._id}`);
    }

    const viewAuthor = () => {
        history.push(`/profile/${sheet.user}`);
    }

    useEffect(() => {
        setVote(sheet.rating)
    }, [sheet])

    useEffect(() => {
        if (userData.isLoaded && userData.token !== undefined) {
            const userID = userData.user.id;
            axios.get(`/api/users/${userID}`)
                .then(res => {
                    setUser(res.data);
                })
                .catch(err => {
                    console.log(`Fail to fetch user: ${err}`);
                });
        }
    }, [userData]);

    useEffect(() => {
        const userID = sheet.user
        axios.get(`/api/users/${userID}`).
            then((res) => {
                setName(res.data.name);
                setNameLoaded(true);
            })
            .catch((err) => {
                console.log(`Fail to fetch user data: ${err}`);
            });
    }, [sheet]);

    return (
        <div id="cheatsheetCard">
            <Card>
                <CardHeader id="cheatsheetcard-title">
                    <div id="cheatsheet-name">
                        <p>{sheet.name}</p>
                    </div>
                    {nameLoaded
                        ? <Button id="cheatsheetcard-author" color="link" size="sm" onClick={viewAuthor}>{name}</Button>
                        : <div></div>
                    }
                    <Rating sheet={sheet} />
                </CardHeader>
                <CardImg top onClick={viewCheatsheet} src={sheet.file} alt="Card image cap" />
                <BookmarkButton sheet={sheet} />
            </Card>
        </div >
    );
}

export default CheatsheetCard;
