import React, { useEffect, useState, useContext } from 'react'
import {Container, Button, Card, CardHeader, CardBody, CardText} from "reactstrap";
import ImagePreviewer from '../components/ImagePreviewer';
import { useParams, useHistory } from 'react-router-dom';
import axios from "axios";
import UserContext from '../context/UserContext';

function View() {
    const {userData} = useContext(UserContext);
    const {id} = useParams();

    const [sheet, setSheet] = useState(null);
    const [school, setSchool] = useState(null);;
    const [module, setModule] = useState(null);

    const [errorMsg, setErrorMsg] = useState("");

    const history = useHistory();

    useEffect(() => {
        if(userData.isLoaded) {
            axios.post(`/api/cheatsheets/${id}`, userData.user)
                .then(cheatsheet => setSheet(cheatsheet.data))
                .catch(err => setErrorMsg(err.response.data.msg));
        }
    }, [id, userData]);

    useEffect(() => {
        if(sheet) {
            axios.get(`/api/schools/${sheet.school}`)
                .then(school => setSchool(school.data));
    
            axios.get(`/api/modules/${sheet.module}`)
                .then(module => setModule(module.data));
        }
    }, [sheet])

    const goHome = () => {
        history.push("/");
    }

    const loginLink = <a href={"/login"}>here</a>

    return (
        <div>
            {
                sheet && school && module
                    ?   <Container>
                            <div>
                                <h2>{sheet.name}</h2>
                                <h3>{`${school.name} - ${module.name}`}</h3>
                                <Button>Bookmark</Button>
                                <Button>Upvote</Button>
                                <Button>Downvote</Button>
                            </div>
                            
                            <ImagePreviewer imageURL={sheet.file}/>

                            <div>
                                Comments Section
                            </div>

                            <div>
                                Similar cheatsheets
                            </div>
                        </Container>
                    :   errorMsg
                        ?   <Container>
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
