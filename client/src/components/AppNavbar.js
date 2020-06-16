import React, { useState, useEffect, useContext } from 'react'
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    Container,
    Button
} from "reactstrap";
import { useHistory } from 'react-router-dom';

import FuseSearchbar from './FuseSearchbar';
import UserContext from '../context/UserContext';

import "./css/AppNavbar.css"

function AppNavbar() {
    const {userData, setUserData} = useContext(UserContext);
    
    const [isOpen, setIsOpen] = useState(false);

    const history = useHistory();

    const register = () => {
        history.push("/register");
    }

    const login = () => {
        history.push("/login");
    }

    const logout = () => {
        setUserData({token: undefined, user: undefined});
        localStorage.setItem("auth-token", "");
    }

    useEffect(() => {
        const toggler = document.querySelector(".navbar-toggler");
        const toggle = () => setIsOpen(!isOpen);
        toggler.addEventListener("click", toggle);
        return () => toggler.removeEventListener("click", toggle);
    }, [isOpen])

    return (
        <div>
            <Navbar color="dark" dark expand="sm" className = "mb-5">
                <Container>
                    <NavbarBrand href="/">
                        Cheato
                    </NavbarBrand>
                    <NavbarToggler />
                    <Collapse isOpen={isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            <NavItem>
                                <FuseSearchbar />
                             </NavItem>
                        <div className="d-flex align-items-center">
                            <NavItem>
                                <NavLink href="/create">
                                    Create
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="/upload">
                                    Upload
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="https://github.com/Tomashiwa/MERN-Rectangle-List">
                                    Github
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                {
                                    userData.user 
                                        ? <Button onClick={logout}>Logout</Button>
                                        : <div>
                                            <Button onClick={register}>Register</Button>
                                            <Button onClick={login}>Login</Button>
                                        </div> 
                                }
                            </NavItem>
                          </div>  
                        </Nav>
                    </Collapse> 
                </Container>
            </Navbar>
        </div>    
    )
}

export default AppNavbar;