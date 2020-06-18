import React, { useEffect, useState, useContext } from 'react'
import {Container, Button   } from "reactstrap";
import ImagePreviewer from '../components/ImagePreviewer';
import { useParams } from 'react-router-dom';
import axios from "axios";
import UserContext from '../context/UserContext';

function View() {
    const {userData} = useContext(UserContext);
    const {id} = useParams();

    const [sheet, setSheet] = useState(null);
    const [school, setSchool] = useState(null);;
    const [module, setModule] = useState(null);

    // useEffect(() => {
    //     console.log("UserData changed !!");
    //     console.log(userData);
    // }, [userData]);

    // useEffect(() => {
    //     console.log("id changed !!");
    //     console.log(id);
    // }, [id]);

    // useEffect(() => {
    //     console.log("sheet changed !!");
    //     console.log(sheet);
    // }, [sheet]);

    useEffect(() => {
        if(userData.isLoaded) {
            axios.post(`/api/cheatsheets/${id}`, userData.user)
                .then(cheatsheet => setSheet(cheatsheet.data));
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

    return (
        <div>
            {
                sheet && school && module
                    ? <Container>
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
                    : <div>Sheet not found</div>
            }
        </div>
    )
}

export default View
