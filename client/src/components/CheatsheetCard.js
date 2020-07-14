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
import { AlexaForBusiness } from 'aws-sdk';

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

   /* useEffect(() => {
        if (user && userData.isLoaded && userData.token !== undefined) {
            const userID = userData.user.id;
            const newBookmarkBtn = document.querySelector(`#bookmarkBtn-${sheet._id}`);

            const bookmarkClicked = () => {
                if (user && userData.isLoaded && userData.token !== undefined) {
                    axios.get(`/api/users/${userID}`)
                        .then(res => {
                            const fetchedUser = res.data;
                            const newArray = fetchedUser.bookmarks.slice(0, fetchedUser.bookmarks.length);
                            if (newArray.filter(item => item !== sheet._id).length !== newArray.length) {
                                var index = newArray.indexOf(sheet._id)
                                newArray.splice(index, 1)
                            } else {
                                newArray.push(sheet._id)
                            }

                            axios.put(`/api/users/${userID}`, { bookmarks: newArray })
                                .catch(err => {
                                    console.log(`Fail to bookmark: ${err}`);
                                });
                            setUser(fetchedUser);
                        })
                        .catch(err => {
                            console.log(`Fail to fetch user: ${err}`);
                        });

                }
            }
            newBookmarkBtn.addEventListener("click", bookmarkClicked);

            return () => {
                newBookmarkBtn.removeEventListener("click", bookmarkClicked);
            }
        }
    }, [user, sheet._id, userData]);*/

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


    /*useEffect(() => {
        if (userData.isLoaded && userData.token !== undefined) {
            const newUpvoteBtn = document.querySelector(`#upvoteBtn-${sheet._id}`);
            const newDownvoteBtn = document.querySelector(`#downvoteBtn-${sheet._id}`);
            const newUpvote = (vote + 1);
            const newDownvote = (vote - 1);
            const doubleUpvote = (vote + 2);
            const doubleDownvote = (vote - 2);


            const userID = userData.user.id;

            const upvoteClicked = () => {
                const upvoteCheck = { id: sheet._id, type: "upvote" }
                const downvoteCheck = { id: sheet._id, type: "downvote" }

                axios.get(`/api/users/${userID}`)
                    .then(res => {
                        const fetchedUser = res.data;
                        const ratedArray = fetchedUser.rated.slice(0, fetchedUser.rated.length);
                        const filteredArray = ratedArray.filter(item => item.id !== upvoteCheck.id)
                            .slice(0, ratedArray.filter(item => (item.id !== upvoteCheck.id).length))
                        const ratedResult = fetchedUser.rated.find(ratedSheet => ratedSheet.id === sheet._id);

                        console.log(ratedArray.indexOf(downvoteCheck))
                        if (filteredArray.length !== ratedArray.length && ratedResult !== undefined && ratedResult.type === "upvote") {
                            var index = ratedArray.indexOf(ratedResult)
                            ratedArray.splice(index, 1)
                        } else if (filteredArray.length !== ratedArray.length && ratedResult !== undefined && ratedResult.type === "downvote") {
                            var value = ratedArray.indexOf(downvoteCheck)
                            ratedArray.splice(value, 1)
                            ratedArray.push(upvoteCheck)
                        } else {
                            ratedArray.push(upvoteCheck)
                        }

                        if (ratedArray.length > fetchedUser.rated.length) {
                            axios.put(`/api/cheatsheets/${sheet._id}`, {
                                rating: newUpvote
                            })
                                .then(res => {
                                    setVote(newUpvote)
                                    axios.put(`/api/users/${userID}`, {
                                        rated: ratedArray
                                    }).catch(err => {
                                        console.log(`Fail to upvote: ${err}`);
                                    })
                                });
                        } else if (ratedArray.length === fetchedUser.rated.length) {
                            axios.put(`/api/cheatsheets/${sheet._id}`, {
                                rating: doubleUpvote
                            })
                                .then(res => {
                                    setVote(doubleUpvote)
                                    axios.put(`/api/users/${userID}`, {
                                        rated: ratedArray
                                    }).catch(err => {
                                        console.log(`Fail to upvote: ${err}`);
                                    })
                                });
                        } else {
                            axios.put(`/api/cheatsheets/${sheet._id}`, {
                                rating: newDownvote
                            })
                                .then(res => {
                                    setVote(newDownvote)
                                    axios.put(`/api/users/${userID}`, {
                                        rated: ratedArray
                                    }).catch(err => {
                                        console.log(`Fail to downvote: ${err}`);
                                    });

                                });
                        }
                    });
            }


            const downvoteClicked = () => {
                console.log(1)
                const upvoteCheck = { id: sheet._id, type: "upvote" }
                const downvoteCheck = { id: sheet._id, type: "downvote" }
                axios.get(`/api/users/${userID}`)
                    .then(res => {
                        const fetchedUser = res.data;
                        const ratedArray = fetchedUser.rated.slice(0, fetchedUser.rated.length);
                        const filteredArray = ratedArray.filter(item => item.id !== downvoteCheck.id)
                            .slice(0, ratedArray.filter(item => item.id !== downvoteCheck.id).length)
                        const ratedResult = fetchedUser.rated.find(ratedSheet => ratedSheet.id === sheet._id);

                        if (filteredArray.length !== ratedArray.length && ratedResult !== undefined && ratedResult.type === "downvote") {
                            var index = ratedArray.indexOf(downvoteCheck)
                            ratedArray.splice(index, 1)
                        } else if (filteredArray.length !== ratedArray.length && ratedResult !== undefined && ratedResult.type === "upvote") {
                            var value = ratedArray.indexOf(upvoteCheck)
                            ratedArray.splice(value, 1)
                            ratedArray.push(downvoteCheck)
                        } else {
                            ratedArray.push(downvoteCheck)
                        }

                        if (ratedArray.length > fetchedUser.rated.length) {
                            axios.put(`/api/cheatsheets/${sheet._id}`, {
                                rating: newDownvote
                            })
                                .then(res => {
                                    setVote(newDownvote)
                                    axios.put(`/api/users/${userID}`, {
                                        rated: ratedArray
                                    }).catch(err => {
                                        console.log(`Fail to upvote: ${err}`);
                                    })
                                });
                        } else if (ratedArray.length === fetchedUser.rated.length) {
                            axios.put(`/api/cheatsheets/${sheet._id}`, {
                                rating: doubleDownvote
                            })
                                .then(res => {
                                    setVote(doubleDownvote)
                                    axios.put(`/api/users/${userID}`, {
                                        rated: ratedArray
                                    }).catch(err => {
                                        console.log(`Fail to upvote: ${err}`);
                                    })
                                });
                        } else {
                            axios.put(`/api/cheatsheets/${sheet._id}`, {
                                rating: newUpvote
                            })
                                .then(res => {
                                    setVote(newUpvote)
                                    axios.put(`/api/users/${userID}`, {
                                        rated: ratedArray
                                    }).catch(err => {
                                        console.log(`Fail to downvote: ${err}`);
                                    });

                                });
                        }
                    });
            }




            newUpvoteBtn.addEventListener("click", upvoteClicked);
            newDownvoteBtn.addEventListener("click", downvoteClicked);

            return () => {
                newUpvoteBtn.removeEventListener("click", upvoteClicked);
                newDownvoteBtn.removeEventListener("click", downvoteClicked);
            };
        }

    }, [vote, sheet._id, userData]);
    <ButtonGroup id="cheatsheetcard-bookmark">
                        <Button id={`bookmarkBtn-${sheet._id}`} >
                            <svg className="bi bi-bookmarks" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M7 13l5 3V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12l5-3zm-4 1.234l4-2.4 4 2.4V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10.234z" />
                                <path d="M14 14l-1-.6V2a1 1 0 0 0-1-1H4.268A2 2 0 0 1 6 0h6a2 2 0 0 1 2 2v12z" />
                            </svg>
                        </Button>
                    </ButtonGroup>
                    #cheatsheetCard{
    width:300px;
    height:278px;
    padding:0px;
    position:relative;
    margin:20px;
    top:0px;
    right:0px;
    background:#fff;
    display:flex;
    transition: .6s ease-out;
    box-shadow:  0 10px 10px rbga(0,0,0),0.5;   
}


#cheatsheetcard-title > #rating-container{
    position:absolute;
    top:0px;
    right:10px;
}

#cheatsheetcard-title > #bookmarkbtn-icon{
    position:absolute;
    top:240px;
    right:5px;
    z-index: 10;
}

#cheatsheetcard-title > #bookmarkbtn-icon-toggled {
    position:absolute;
    top:240px;
    right:5px;
    z-index: 10;
}
	

#cheatsheetcard-author{
    display:flex;
    position:absolute;
    top:30px;
}

.card{
    width:300px;
    height:278px
}

#cheatsheetcard-title.card-header{
    display:flex;
}

.card-img-top {
    width:298px;
    height:210.67px;
    position:relative;
    bottom:0px;
    left:0px;
    object-fit:cover;
    cursor: pointer;

}

#cheatsheetcard-title.card-header{
    width:300px;
    height:65px;
}

*/


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
