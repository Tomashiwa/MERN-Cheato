import React from 'react'
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

import Container from "reactstrap/lib/Container";
import Button from "reactstrap/lib/Button";
import Card from "reactstrap/lib/Card";
import CardHeader from "reactstrap/lib/CardHeader";
import CardBody from "reactstrap/lib/CardBody";
import CardText from "reactstrap/lib/CardText";

function NotFound() {
    const history = useHistory();

    const goHome = () => {
        history.push("/");
    }

    return (
        <Container id="notfound-container">
            <Card>
                <CardHeader tag="h3">Page not found</CardHeader>
                <CardBody>
                    <CardText>
                        The page you trying to access does not exist. Please try again or return to home.
                    </CardText>
                    <Button onClick={goHome}>Back to Home</Button>
                </CardBody>
            </Card>
        </Container> 
)
}

export default NotFound
