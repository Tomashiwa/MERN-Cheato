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
} from "reactstrap";

import FuseSearchbar from './FuseSearchbar';
import UserContext from '../context/UserContext';

import "./css/AppNavbar.css"
import UserDropdown from './UserDropdown';

function AppNavbar() {
    const {userData} = useContext(UserContext);
    
    const [isOpen, setIsOpen] = useState(false);

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
                    {
                        !userData.isLoaded
                            ? <div></div>
                            : <Collapse isOpen={isOpen} navbar>
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
                                    {
                                        userData.user
                                            ? <NavItem>
                                                <UserDropdown />
                                            </NavItem>
                                            : <>
                                                <NavItem>
                                                    <NavLink href="/register">Register</NavLink>
                                                </NavItem>
                                                <NavItem>
                                                    <NavLink href="/login">Login</NavLink>
                                                </NavItem>
                                            </>
                                    }
                                </div>  
                                </Nav>
                            </Collapse> 
                    }
                </Container>
            </Navbar>
        </div>    
    )
}

export default AppNavbar;