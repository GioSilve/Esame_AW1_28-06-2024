import { useEffect, useState } from 'react';
import { Row, Alert, Col, ListGroup, ListGroupItem, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import TimerLayout from './TimerLayout';
import API from '../API.mjs';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function RoundLayout(props) {
/*
                    <Col>
                        <h2 className="col mt-3 ms-3">Here the game will start</h2>
                        <p>{props.game.rounds[0].random_captions.map((c) => c.caption).join('----')}</p>
                        <img src={props.game.rounds[0].image} alt={props.game.rounds[0].image} height={300}/>
                    </Col>*/
    const [currentRound, setCurrentRound] = useState(props.round);
    const [message, setMessage] = useState('');
    const [roundEnded, setRoundEnded] = useState(false);
    const [guessed, setGuessed] = useState(false);
    const [roundScore, setRoundScore] = useState(0);
    const [selectedCaptionID, setSelectedCaptionID] = useState();
    const [correctCaptions, setCorrectCaptions] = useState([]);

    const endRound = async (captionObj, timeExpired) => {
        try {
            setRoundEnded(true);
            let match = {correct: false};
            if (timeExpired) {
                match.correct_captions = await API.fetchGetCorrectCaptionsByMeme(currentRound.memeID);
            } else {
                match = await API.fetchCheckMatch(captionObj.captionID, currentRound.memeID);
                setSelectedCaptionID(captionObj.captionID);                
            }
            if (match.correct) {
                setGuessed(true);
                setRoundScore(5);
                if (props.loggedIn) {
                    props.increaseScore(5);
                    props.addGuessedMeme(currentRound.memeID, currentRound.image, captionObj.caption);
                    props.addRoundOutcome(currentRound.memeID, 5);
                }
            } else {
                setCorrectCaptions(match.correct_captions);
                if (props.loggedIn) {
                    props.addRoundOutcome(currentRound.memeID, 0);
                }
            }
        } catch (err) {
            setMessage({ msg: err.message, type: 'danger' });
        }
    }

    const addListItemClass = (captionID) => {
        if ((guessed && selectedCaptionID == captionID) || (!guessed && correctCaptions.includes(captionID))) {
            return "correctCaptionClass";
        } else if (!guessed && selectedCaptionID == captionID) {
            return "wrongCaptionClass";
        }
        return "";
    } 

    const addListItemIcon = (captionID) => {
        if ((guessed && selectedCaptionID == captionID) || (!guessed && correctCaptions.includes(captionID))) {
            return <i className="bi bi-check-lg">&ensp;</i>;
        } else if (!guessed && selectedCaptionID == captionID) {
            return <i className="bi bi-x-lg">&ensp;</i>;
        }
        return <></>;
    }

    return (
        <>
            {message && <Row><Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert></Row>}
            <Col xs={4} className="d-flex justify-content-start">
                <TimerLayout key={currentRound.memeID} roundEnded={roundEnded} endRound={endRound}/>
            </Col>
            <Col xs={6} className="d-flex justify-content-end">
                <img src={currentRound.image} alt={currentRound.image} height={300}/>
            </Col>
            <Col xs={6} className="d-flex justify-content-start">
                <ListGroup className="d-block">
                    {!roundEnded ?
                        currentRound.random_captions.map((c) => <ListGroupItem key={c.captionID} action onClick={() => endRound(c, false)}>{c.caption}</ListGroupItem>)
                    :
                        currentRound.random_captions.map((c) => <ListGroupItem key={c.captionID} className={addListItemClass(c.captionID)}>{addListItemIcon(c.captionID)}{c.caption}</ListGroupItem>)
                    }
                </ListGroup>
            </Col>
            {roundEnded &&
            <>
                <Row>
                    <Col className="d-flex justify-content-center">
                        <h2 className="mt-5">You scored {roundScore} points in this round!</h2>
                    </Col>
                </Row>
                <Row>
                    <Col className="d-flex justify-content-evenly my-5">
                        <Link to="/" className="btn btn-primary">HOME</Link>
                        {props.loggedIn ?
                            <>
                                {props.currentRoundIndex == props.lastRoundIndex && <Button className="btn btn-primary" onClick={props.displayRecap}>VIEW RESULTS</Button>}
                                <Button className="btn btn-primary" onClick={() => props.currentRoundIndex == props.lastRoundIndex ? props.startGame() : props.increaseCurrentRoundIndex()}>{props.currentRoundIndex == props.lastRoundIndex ? "PLAY AGAIN" : "NEXT ROUND"}</Button>
                            </>
                            :
                            <Button className="btn btn-primary" onClick={props.startGame}>PLAY AGAIN AS GUEST</Button>
                        }
                    </Col>
                </Row>
            </>
            }
        </>
    );
};
        