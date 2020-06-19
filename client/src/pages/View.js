import React, { useEffect, useState, useContext } from 'react'
import { Container, Button, Card, CardHeader, CardBody, CardText } from "reactstrap";
import { useParams, useHistory } from 'react-router-dom';

import axios from "axios";

import UserContext from '../context/UserContext';
import ImagePreviewer from '../components/ImagePreviewer';

import "./css/View.css"

function View() {
    const {userData} = useContext(UserContext);
    const {id} = useParams();

    const [sheet, setSheet] = useState(null);
    const [school, setSchool] = useState(null);;
    const [module, setModule] = useState(null);

    const [errorMsg, setErrorMsg] = useState("");

    const history = useHistory();

    // Fetch cheatsheet to be viewed
    useEffect(() => {
        if(userData.isLoaded) {
            axios.post(`/api/cheatsheets/${id}`, userData.user)
                .then(cheatsheet => setSheet(cheatsheet.data))
                .catch(err => setErrorMsg(err.response.data.msg));
        }
    }, [id, userData]);

    // Fetch the respective school and module of the sheet
    useEffect(() => {
        if(sheet) {
            axios.get(`/api/schools/${sheet.school}`)
                .then(school => setSchool(school.data));
    
            axios.get(`/api/modules/${sheet.module}`)
                .then(module => setModule(module.data));
        }
    }, [sheet])

    // Bookmark event
    useEffect(() => {
        if(document.querySelector("#view-btn-bookmark")) {
            const bookmarkBtn = document.querySelector("#view-btn-bookmark");
            
            const bookmark = () => {
                console.log("Bookmarked !!");
            };
    
            bookmarkBtn.addEventListener("click", bookmark);

            return () => {
                bookmarkBtn.removeEventListener("click", bookmark);
            }
        }
    })

    // Upvote and downvote events
    useEffect(() => {
        if(document.querySelector("#view-btn-upvote") && document.querySelector("#view-btn-downvote")) {
            const upvoteBtn = document.querySelector("#view-btn-upvote");
            const downvoteBtn = document.querySelector("#view-btn-downvote");
            
            const upvote = () => {
                console.log("Upvoted !!");
            };

            const downvote = () => {
                console.log("Downvoted !!");
            };
    
            upvoteBtn.addEventListener("click", upvote);
            downvoteBtn.addEventListener("click", downvote);
            
            return () => {
                upvoteBtn.removeEventListener("click", upvote);
                downvoteBtn.removeEventListener("click", downvote);
            }
        }
    })

    const goHome = () => {
        history.push("/");
    }

    const loginLink = <a href={"/login"}>here</a>

    return (
        <div>
            {
                sheet && school && module
                    ?   <Container id="view-container">
                            <div id="view-header">
                                <div id="view-description">
                                    <h2>{sheet.name}</h2>
                                    <h3>{`${school.name} - ${module.name}`}</h3>
                                    <h4>{`Uploaded by: ${userData.user.name}`}</h4>
                                </div>

                                <div id="view-feedback">
                                    <Button id="view-btn-bookmark">Bookmark</Button>
                                    <Button id="view-btn-upvote">Upvote</Button>
                                    <Button id="view-btn-downvote">Downvote</Button>
                                </div>
                            </div>
                            
                            <ImagePreviewer imageURL={sheet.file}/>

                            <div id="view-footer">
                                <div id="view-comments">
                                    <h5>Comments</h5>
                                </div>

                                <div id="view-similars">
                                    <h5>Similar cheatsheets</h5>
                                </div>
                            </div>
                        </Container>
                    :   errorMsg
                        ?   <Container id="view-container-error">
                                <Card>
                                    <CardHeader tag="h3">{errorMsg}</CardHeader>
                                    <CardBody>
                                        {
                                            errorMsg === "No cheatsheet found"
                                                ?   <CardText>
                                                        The cheatsheet you trying to acccess does not exist. You may try to find it in the search bar above.
                                                    </CardText> 
                                                : userData.user === undefined 
                                                    ?   <CardText>
                                                            If you are the owner of this sheet, please try again after logging in {loginLink}.
                                                        </CardText> 
                                                       :   <CardText>
                                                            This account do not have access to this cheatsheet. You can only view it after the owner enable public access.
                                                        </CardText> 
                                        }
                                        <Button onClick={goHome}>Back to Home</Button>
                                    </CardBody>
                                </Card>
                            </Container> 
                        :   <div></div>
            }
        </div>
    )
}

export default View
