import React, { useState, useEffect } from 'react'
import { BrowserRouter, Switch, Route } from "react-router-dom"
import axios from "axios"

import UserContext from "./context/UserContext";

import Home from "./pages/Home"
import Create from "./pages/Create"
import Upload from "./pages/Upload"
import Edit from "./pages/Edit"
import Register from "./pages/Register"
import Login from "./pages/Login"

import "bootstrap/dist/css/bootstrap.min.css"
import './App.css'
import AppNavbar from './components/AppNavbar';
import View from './pages/View';
import NotFound from './pages/NotFound';

function App() {
	const [userData, setUserData] = useState({
		token: undefined,
		user: undefined,
		isLoaded: false
	});

	useEffect(() => {
		// Check if there's any token in local storage and use it to retrieve user information
		const checkLoggedIn = async() => {
			let token = localStorage.getItem("auth-token");

			if(!token) {
				localStorage.setItem("auth-token", "");
				token = "";
			}

			const tokenRes = await axios.post("/api/users/tokenIsValid", null, {headers: {"Content-Type": "application/json", "x-auth-token": token}});

			if(tokenRes.data.isValid) {
				setUserData({token, user: tokenRes.data.user, isLoaded: true});
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
					{
						userData.isLoaded
							?	<Switch>
									<Route exact path="/create" component={Create} />
									<Route exact path="/upload" component={Upload} />
									<Route exact path="/view/:id" component={View} />
									{ userData.token === undefined && 
									
									<Route exact path="/edit/:id" component={Edit} />}
									{ userData.token === undefined && <Route exact path="/register" component={Register}/>}
									{ userData.token === undefined && <Route exact path="/login" component={Login}/>}
									<Route exact path="/" component={Home} />
									<Route exact path="*" component={NotFound} />
								</Switch>
							: 	<div></div>
					}
				</div>
			</UserContext.Provider>
		</BrowserRouter>
  	);
}

export default App;
