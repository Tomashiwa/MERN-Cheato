import React, { useState, useEffect } from 'react'
import { BrowserRouter, Switch, Route } from "react-router-dom"
import axios from "axios"

import UserContext from "./context/UserContext";

import Home from "./pages/Home"
import Create from "./pages/Create"
import Upload from "./pages/Upload"
import Register from "./pages/Register"
import Login from "./pages/Login"

import "bootstrap/dist/css/bootstrap.min.css"
import './App.css'
import AppNavbar from './components/AppNavbar';

function App() {
	const [userData, setUserData] = useState({
		token: undefined,
		user: undefined,
		isLoaded: false
	});

	useEffect(() => {
		// Check if there's any token in local storage and use it to retrieve user information
		const checkLoggedIn = async() => {
			console.log("Checking whether user had logged in...");

			let token = localStorage.getItem("auth-token");

			if(!token) {
				console.log("No token found, creating a blank token");

				localStorage.setItem("auth-token", "");
				token = "";
			}

			const tokenRes = await axios.post("/api/users/tokenIsValid", null, {headers: {"x-auth-token": token}});

			if(tokenRes.data.isValid) {
				setUserData({token, user: tokenRes.data.user, isLoaded: true});
				console.log("Token verified, updated user data based on that token");
			} else {
				setUserData({token: undefined, user: undefined, isLoaded: true});
			}
		}

		checkLoggedIn();
	}, []);

	return (
		<BrowserRouter>
			<UserContext.Provider value={{userData, setUserData}}>
				<AppNavbar />
				<div>
					<Switch>
						<Route path="/create" component={Create} />
						<Route path="/upload" component={Upload} />
						<Route path="/register" component={Register}/>
						<Route path="/login" component={Login}/>
						<Route path="/" component={Home} />
					</Switch>
				</div>
			</UserContext.Provider>
		</BrowserRouter>
  	);
}

export default App;
