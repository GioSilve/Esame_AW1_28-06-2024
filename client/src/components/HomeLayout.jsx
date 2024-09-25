import { Row, Col, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function HomeLayout(props) {
    return (
        <>
            <main className="col m-0 h-100">
                {props.message && <Row><Alert variant={props.message.type} onClose={() => props.setMessage('')} dismissible>{props.message.msg}</Alert></Row>}
                <Row className="mx-5">
                    {!props.loggedIn ?
                    <>
                        <h2 className="mt-5 mb-0 px-5 text-center"> Welcome!</h2>
                        <p className="my-5 px-5 text-center">This is an online version of the popular board game <i>"What Do You Meme?"</i>. The goal is to guess the caption that you think best fits the meme in a maximum of 30 seconds. You can play now quick games of one round each or log in to unlock longer games and a history of your past games!</p>
                    </>
                    :
                    <>
                        <h2 className="mt-5 mb-0 px-5 text-center"> Welcome back, {props.user.username}!</h2>
                        <p className="my-5 px-5 text-center">Click the button below to play three rounds when you're ready!</p>
                    </>
                    }
                </Row>
                <Row>
                    {!props.loggedIn ?
                        <Col className="d-flex justify-content-evenly mt-5">
                            <Button className="btn btn-primary" onClick={props.startGame}>PLAY AS GUEST</Button>
                            <Link to="/login" className="btn btn-primary">LOGIN</Link>
                        </Col>
                    :
                        <Col className="d-flex justify-content-center">
                            <Button className="btn btn-primary" onClick={props.startGame}>PLAY</Button>
                        </Col>
                    }
                </Row>
            </main>
        </>
    );
};
