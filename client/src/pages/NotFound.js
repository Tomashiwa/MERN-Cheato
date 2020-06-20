import React from 'react'
import { Container, Button, Card, CardHeader, CardBody, CardText } from "reactstrap";
import { useHistory } from 'react-router-dom';

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
                        The page you trying to acccess does not exist. Please try again or return to home.
                    </CardText>
                    <Button onClick={goHome}>Back to Home</Button>
                </CardBody>
            </Card>
        </Container> 
)
}

export default NotFound
