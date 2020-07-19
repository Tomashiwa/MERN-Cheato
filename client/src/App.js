import React, { Suspense, useState, useEffect } from 'react'
import { BrowserRouter, Switch, Route } from "react-router-dom"
import axios from "axios"

import Spinner from 'reactstrap/lib/Spinner';

import UserContext from "./context/UserContext";
import AppNavbar from './components/AppNavbar';

import "./output/_mixins.css";
import "./output/_compiled.css";
// import "bootstrap/dist/css/bootstrap.min.css"
import './App.css'
import ScrollToView from './components/ScrollToView';

const Home = React.lazy(() => import("./pages/Home"));
const Create = React.lazy(() => import("./pages/Create"));
const Upload = React.lazy(() => import("./pages/Upload"));
const View = React.lazy(() => import("./pages/View"));
const Edit = React.lazy(() => import("./pages/Edit"));
const Register = React.lazy(() => import("./pages/Register"));
const Login = React.lazy(() => import("./pages/Login"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Profile = React.lazy(() => import("./pages/Profile"));
const MyUpload = React.lazy(() => import("./pages/MyUpload"));
const MyBookmark = React.lazy(() => import("./pages/MyBookmark"));

function App() {
	const [userData, setUserData] = useState({
		token: undefined,
		user: undefined,
		isLoaded: false
	});

	useEffect(() => {
		// Check if there's any token in local storage and use it to retrieve user information
		const checkLoggedIn = async () => {
			let token = localStorage.getItem("auth-token");

			if (!token) {
				localStorage.setItem("auth-token", "");
				token = "";
			}

			const tokenRes = await axios.post("/api/users/tokenIsValid", null, { headers: { "Content-Type": "application/json", "x-auth-token": token } });

			if (tokenRes.data.isValid) {
				setUserData({ token, user: tokenRes.data.user, isLoaded: true });
			} else {
				setUserData({ token: undefined, user: undefined, isLoaded: true });
			}
		}

		checkLoggedIn();
	}, []);

	return (
		<BrowserRouter>
			<ScrollToView>
				<UserContext.Provider value={{ userData, setUserData }}>
					<AppNavbar />
					<div>
						{
							userData.isLoaded
								? <Suspense fallback={<div className="center-screen stretch-height"><Spinner color="warning"/></div>}>
									<Switch>
										<Route exact path="/create" component={Create} />
										<Route exact path="/upload" component={Upload} />
										<Route exact path="/view/:id" component={View} />
										{userData.token !== undefined && <Route exact path="/edit/:id" component={Edit} />}
										{userData.token === undefined && <Route exact path="/register" component={Register} />}
										{userData.token === undefined && <Route exact path="/login" component={Login} />}
										<Route exact path="/profile/:userID" component={Profile} />
										<Route exact path="/MyUpload/:userID" component={MyUpload} />
										<Route exact path="/MyBookmark/:userID" component={MyBookmark} />
										<Route exact path="/" component={Home} />
										<Route exact path="*" component={NotFound} />
									</Switch>
								</Suspense>
								: <div></div>
						}
					</div>
				</UserContext.Provider>
			</ScrollToView>
		</BrowserRouter>
	);
}

export default App;
