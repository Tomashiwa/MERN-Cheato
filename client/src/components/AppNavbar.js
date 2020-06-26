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

    const toggle = () => setIsOpen(!isOpen);

    return (
        <div>
            <Navbar color="dark" dark expand="sm" className = "mb-5">
                <Container id="navbar-container">
                    <NavbarBrand href="/">
                        Cheato
                    </NavbarBrand>
                    {
                        userData.isLoaded
                        ?   <>
                                <NavbarToggler onClick={toggle}/>
                                <Collapse isOpen={isOpen} navbar>
                                    <div class="mr-auto">
                                        <FuseSearchbar />
                                    </div>
                                    <ul class="nav navbar-nav navbar-right">
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
                                    </ul>
                                </Collapse> 
                            </> 
                            : <div></div>
                    }
                </Container>
            </Navbar>
        </div>    
    )
}

export default AppNavbar;