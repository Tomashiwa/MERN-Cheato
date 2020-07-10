import React, { useState, useContext } from 'react'

import UserDropdown from './UserDropdown';
import Navbar from 'reactstrap/lib/Navbar';
import Collapse from 'reactstrap/lib/Collapse';
import Container from 'reactstrap/lib/Container';
import NavbarBrand from 'reactstrap/lib/NavbarBrand';
import NavbarToggler from 'reactstrap/lib/NavbarToggler';
import NavItem from 'reactstrap/lib/NavItem';
import NavLink from 'reactstrap/lib/NavLink';

import FuseSearchbar from './FuseSearchbar';
import UserContext from '../context/UserContext';

import "./css/AppNavbar.css"

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
                                    <div className="mr-auto">
                                        <FuseSearchbar />
                                    </div>
                                    <ul className="nav navbar-nav navbar-right">
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