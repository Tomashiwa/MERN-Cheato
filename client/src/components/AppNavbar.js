import React, { useState, useEffect,useContext } from 'react'
import { UserContext } from "../App";
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    Container
} from "reactstrap";

function AppNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const userContext = useContext(UserContext);
    
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
                                <form className = "form-inline">
                                    <input className = "form-control mr-sm-1" type = "search"
                                        placeholder = "Search" >
                                    </input>
                                    <button className = "btn btn-light my-sm-2" type = "submit">
                                        <svg className ="bi bi-search" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z"/>
                                            <path fillRule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/>
                                        </svg>
                                    </button>
                                </form>
<<<<<<< Updated upstream
                            </NavItem>
=======
                             </NavItem>
                        <div className="d-flex align-items-center">
>>>>>>> Stashed changes
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
                               <NavLink>
                                    Login
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </Collapse> 
                </Container>
            </Navbar>
        </div>
    )
}

export default AppNavbar;