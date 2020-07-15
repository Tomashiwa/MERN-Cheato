import React, { useEffect, useState, useContext } from 'react'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import axios from 'axios';

import UserContext from "../context/UserContext";

import Rating from "../components/Rating";
import BookmarkButton from "../components/BookmarkButton";

import Card from "reactstrap/lib/Card";
import CardImg from "reactstrap/lib/CardImg";
import Button from "reactstrap/lib/Button";
import CardHeader from "reactstrap/lib/CardHeader";

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

        if(!sheet.isAnonymous) {
            axios.get(`/api/users/${userID}`).
                then((res) => {
                    setName(res.data.name);
                    setNameLoaded(true);
                })
                .catch((err) => {
                    console.log(`Fail to fetch user data: ${err}`);
                });
        }
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
                <CardImg top onClick={viewCheatsheet} src={sheet.thumbnail} alt="Card image cap" />
                <div className="bookmarkbtn-container">
                    <BookmarkButton id="testbookmark" sheet={sheet} />
                </div>
            </Card>
        </div >
    );
}

export default CheatsheetCard;
