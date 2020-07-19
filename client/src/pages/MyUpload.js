import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import Container from "reactstrap/lib/Container";

import Gallery from "../components/Gallery";
import UserContext from '../context/UserContext';

function MyUpload() {
    const { userData } = useContext(UserContext);

    // const [user, setUser] = useState(null);
    const [upload, setUpload] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const { userID } = useParams();

    // useEffect(() => {
    //     if (userData.isLoaded && userData.token !== undefined) {
    //         axios
    //             .get(`/api/users/${userID}`)
    //             .then((res) => {
    //                 setUser(res.data);
    //             })
    //             .catch((err) => {
    //                 console.log(`Fail to fetch user data: ${err}`);
    //             });
    //     }
    // }, [userData,userID]);

    useEffect(() => {
        axios
            .get(`/api/cheatsheets/byUser/${userID}`)
            .then((res) => {
                setUpload(res.data);
                setIsLoaded(true);
            })
            .catch((err) => {
                console.log(`Fail to fetch cheatsheets: ${err}`);
            });
    }, [userID]);

    return (
        <div>
			{isLoaded ? (
                <Container>
                    <h3>...'s Uploads</h3>
                    <Gallery
                        injectedSheets={upload}
                        // title={userData.user !== undefined && userData.user.id === userID ? "My Uploads" : `${user.name}'s Uploads`}
                        hasToolbar={false}
                        hasPagination={true}
                    />
                </Container>
			) : (
				<div></div>
			)}
		</div>
    )
}

export default MyUpload;