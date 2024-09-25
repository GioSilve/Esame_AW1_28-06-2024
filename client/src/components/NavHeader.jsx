import { Container, Navbar, Button, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

function NavHeader(props) {
    const navigate = useNavigate();
    return (
        <Navbar expand="lg" fixed="top">
            <Container fluid className="justify-content-center">
                <Row className="w-100">
                    <Col xs={3}></Col>
                    <Col xs={6} className="d-flex justify-content-center">
                        <Navbar.Brand onClick={() => navigate("/")} className="mb-0 h1 mx-auto">What Do You Meme?</Navbar.Brand>
                    </Col>
                    <Col xs={3} className="d-flex justify-content-end">
                        {props.loggedIn ? 
                            <>
                                <Link to='/user/history' className="btn navbar-btn"><i className="bi bi-person-circle"></i></Link>
                                <Button onClick={props.logout} className="btn navbar-btn"><i className="bi bi-box-arrow-right"></i></Button>
                            </>
                        :
                        <Link to="/login" className="btn navbar-btn">Login</Link>
                        }
                    </Col>
                </Row>
            </Container>
        </Navbar>
    );
}

export default NavHeader;