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