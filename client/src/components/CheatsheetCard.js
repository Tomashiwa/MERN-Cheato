import React, { useEffect, useState, useContext } from 'react'
import { useHistory } from 'react-router-dom';

import UserContext from "../context/UserContext";

import "./css/CheatsheetCard.css"

import axios from 'axios';

function CheatsheetCard({ sheet }) {
    var [vote, setVote] = useState(sheet.rating);
    const [user, setUser] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const { userData } = useContext(UserContext);
    const isLoggedin = userData.isLoaded && userData.token !== undefined
    
    
    const history = useHistory();
    
    const viewCheatsheet = () => {
        history.push(`/view/${sheet._id}`);
    }
    useEffect(() => {
        setVote(sheet.rating)
    },[sheet])

    useEffect(() => {
        if (userData.isLoaded && userData.token !== undefined) {
            const userID = userData.user.id;
            axios.get(`/api/users/${userID}`)
                .then(res => {
                    setUser(res.data);
                    setLoaded(true);
                })
                .catch(err => {
                    console.log(`Fail to fetch user: ${err}`);
                });
        }
    }, [userData]);

    useEffect(() => {
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
    }, [user, sheet._id, userData]);

    useEffect(() => {
        if (userData.isLoaded && userData.token !== undefined) {
            const newUpvoteBtn = document.querySelector(`#upvoteBtn-${sheet._id}`);
            const newDownvoteBtn = document.querySelector(`#downvoteBtn-${sheet._id}`);
            const newUpvote = (vote + 1);
            const newDownvote = (vote - 1);


            const userID = userData.user.id;

            const upvoteClicked = () => {
                const upvoteCheck = { id: sheet._id, type: "upvote" }
                console.log(upvoteCheck)
                console.log(sheet._id)
                axios.get(`/api/users/${userID}`)
                    .then(res => {
                        const fetchedUser = res.data;
                        const ratedArray = fetchedUser.rated.slice(0, fetchedUser.rated.length);
                        const filteredArray = ratedArray.filter(item => item.id !== upvoteCheck.id)
                            .slice(0, ratedArray.filter(item => item.id !== upvoteCheck.id).length)
                        console.log(ratedArray)

                        console.log(filteredArray)
                        if (filteredArray.length !== ratedArray.length) {
                            var index = ratedArray.indexOf(upvoteCheck)
                            ratedArray.splice(index, 1)
                            console.log(ratedArray + "GOOD")
                        } else {
                            ratedArray.push(upvoteCheck)
                            console.log(ratedArray + "BAD")
                        }

                        if (ratedArray.length > fetchedUser.rated.length) {
                            console.log("BAD")
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
                        } else {
                            console.log("GOOD")
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
                const downvoteCheck = { id: sheet._id, type: "downvote" }
                axios.get(`/api/users/${userID}`)
                    .then(res => {
                        const fetchedUser = res.data;
                        const ratedArray = fetchedUser.rated.slice(0, fetchedUser.rated.length);
                        const filteredArray = ratedArray.filter(item => item.id !== downvoteCheck.id)
                            .slice(0, ratedArray.filter(item => item.id !== downvoteCheck.id).length)

                        if (filteredArray.length !== ratedArray.length) {
                            var index = ratedArray.indexOf(downvoteCheck)
                            ratedArray.splice(index, 1)
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

    }, [vote, sheet._id]);

    return (
        <div class="row">
            <div class="col-md-4">
                <div class="cheatsheet">
                    <img src={sheet.file} alt="" class="img-fluid"></img>
                    <div class="cheatsheet-text">
                        <p>{sheet.name}</p>
                    </div>
                    <div class="cheatsheet-rating">
                        <p>Vote:{vote}</p>
                    </div>
                    <div class="similar">
                        <button type="button" id={`similarBtn-${sheet._id}`} class="btn btn-outline-dark">
                            <svg class="bi bi-collection" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" d="M14.5 13.5h-13A.5.5 0 0 1 1 13V6a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5zm-13 1A1.5 1.5 0 0 1 0 13V6a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 16 6v7a1.5 1.5 0 0 1-1.5 1.5h-13zM2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3zm2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1z" />
                            </svg>
                        </button>
                    </div>
                    <div class="author">
                        <button type="button" id={`authorBtn-${sheet._id}`} class="btn btn-outline-dark">
                            <svg class="bi bi-person-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                            </svg>
                        </button>
                    </div>
                    <div class="view">
                        <button type="button" id={`viewBtn-${sheet._id}`} onClick = {viewCheatsheet} class="btn btn-outline-dark">
                            <svg class="bi bi-card-image" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" d="M14.5 3h-13a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z" />
                                <path d="M10.648 7.646a.5.5 0 0 1 .577-.093L15.002 9.5V13h-14v-1l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71z" />
                                <path fill-rule="evenodd" d="M4.502 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
                            </svg>
                        </button>
                    </div>
                    {isLoggedin ?
                    <div class="userBtns">
                        <div class="upvote">
                            <button type="button" id={`upvoteBtn-${sheet._id}`} class="btn btn-outline-dark">
                                <svg class="bi bi-arrow-up-short" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M8 5.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5z" />
                                    <path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8 5.707 5.354 8.354a.5.5 0 1 1-.708-.708l3-3z" />
                                </svg>
                            </button>
                        </div>
                        <div class="downvote">
                            <button type="button" id={`downvoteBtn-${sheet._id}`} class="btn btn-outline-dark">
                                <svg class="bi bi-arrow-down-short" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M4.646 7.646a.5.5 0 0 1 .708 0L8 10.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z" />
                                    <path fill-rule="evenodd" d="M8 4.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5z" />
                                </svg>
                            </button>
                        </div>
                        <div class="bookmark">
                            <button type="button" id={`bookmarkBtn-${sheet._id}`} class="btn btn-outline-dark">
                                <svg class="bi bi-bookmarks" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M7 13l5 3V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12l5-3zm-4 1.234l4-2.4 4 2.4V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10.234z" />
                                    <path d="M14 14l-1-.6V2a1 1 0 0 0-1-1H4.268A2 2 0 0 1 6 0h6a2 2 0 0 1 2 2v12z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    :<div></div>
                    }
                </div>
            </div>
        </div>


    )
}


export default CheatsheetCard;