import React, { useState, useEffect, useContext } from "react";

import Gallery from "../components/Gallery";

import axios from "axios";

import { useParams } from "react-router-dom";

import UserContext from '../context/UserContext';

function MyUpload() {
    const { userData } = useContext(UserContext);

    const [user, setUser] = useState(null);
    const [upload, setUpload] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const { userID } = useParams();

    useEffect(() => {
        if (userData.isLoaded && userData.token !== undefined) {
            axios
                .get(`/api/users/${userID}`)
                .then((res) => {
                    setUser(res.data);
                })
                .catch((err) => {
                    console.log(`Fail to fetch user data: ${err}`);
                });
        }
    }, [userData,userID]);

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
				<Gallery
					injectedSheets={upload}
					title={userData.user.id === userID ? "My Uploads" : `${user.name}'s Uploads`}
					hasToolbar={false}
					hasPagination={false}
				/>
			) : (
				<div></div>
			)}
		</div>
    )
}

export default MyUpload;