import React, { useState, useEffect } from 'react'
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

    const toggle = () => setIsOpen(!isOpen);

    useEffect(() => {
        document.querySelector(".navbar-toggler").addEventListener("click", toggle);
        return () => document.querySelector(".navbar-toggler").removeEventListener("click", toggle);
    })

    return (
        <div>
            <Navbar color="dark" dark expand="sm" className = "mb-5">
                <Container>
                    <NavbarBrand href="/">
                        Cheato
                    </NavbarBrand>
                    <NavbarToggler id="toggler" />
                    <Collapse isOpen={isOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            <NavItem>
                                <NavLink href="https://github.com/Tomashiwa/MERN-Rectangle-List">
                                    Github
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