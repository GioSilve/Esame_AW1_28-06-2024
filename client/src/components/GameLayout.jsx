import { useEffect, useState } from 'react';
import { Row, Alert, Col, Button, Modal, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import RoundLayout from './RoundLayout.jsx';
import API from '../API.mjs';

export default function GameLayout(props) {
    const [currentGame, setCurrentGame] = useState(undefined);
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [gameOutcome, setGameOutcome] = useState([]);
    const [guessedMemes, setGuessedMemes] = useState([]);
    const [showRecap, setShowRecap] = useState(false);
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState('');

    let loadedGame = false;
    useEffect(() => {
        const loadGame = async () => {
            try {
                let newGame = await API.fetchstartGame(props.loggedIn ? 3 : 1);              
                setCurrentGame(newGame);
                //console.log("Game loaded");
            } catch (err) {
                setMessage({ msg: err.message, type: 'danger' });
            }
        };
        if (!loadedGame) {
            loadGame();
            loadedGame = true;
        }
    }, []);

    useEffect(() => {
        const saveGame = async () => {
            //console.log(gameOutcome);
            try {
                await API.fetchSaveGame(gameOutcome, score, currentGame.gameID);
                setShowRecap(true);
            } catch (err) {
                setMessage({ msg: err.message, type: 'danger' });
            }
        };
        if (currentGame && (gameOutcome.length == currentGame.rounds.length)) {
            saveGame();            
        }
    }, [gameOutcome]);

    const addRoundOutcome = (memeID, roundScore) => {
        setGameOutcome([...gameOutcome, { memeID, roundScore }]);
    }

    const addGuessedMeme = (memeID, image, caption) => {
        setGuessedMemes([...guessedMemes, { memeID, image, caption }]);
    }

    const increaseScore = (s) => {
        setScore(score => score + s);
    }

    const increaseCurrentRoundIndex = () => {
        setCurrentRoundIndex(currentRoundIndex => currentRoundIndex + 1);
    }

    const displayRecap = () => {
        setShowRecap(true);
    }

    return (
        <>
            {currentGame ?
                <main className="col m-0 h-100">
                    {props.message && <Row><Alert variant={props.message.type} onClose={() => props.setMessage('')} dismissible>{props.message.msg}</Alert></Row>}
                    {message && <Row><Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert></Row>}
                    <Row>
                        {props.loggedIn ? 
                        <>
                            <Col xs={4} className="d-flex justify-content-end">
                                <h3 className="mt-5 mb-5">Round {currentRoundIndex + 1}</h3>
                            </Col>
                            <Col xs={4} className="d-flex justify-content-center">
                                <h3 className="mt-5 mb-5">Score: {score}</h3>
                            </Col>
                        </>
                        :
                            <Col xs={8}></Col>
                        }
                        {currentGame.rounds.map(round => currentGame.rounds.indexOf(round) == currentRoundIndex && <RoundLayout key={round.memeID} loggedIn={props.loggedIn} round={round} currentRoundIndex={currentRoundIndex} lastRoundIndex={currentGame.rounds.length - 1} increaseCurrentRoundIndex={increaseCurrentRoundIndex} addRoundOutcome={addRoundOutcome} addGuessedMeme={addGuessedMeme} increaseScore={increaseScore} displayRecap={displayRecap} startGame={props.startGame}/>)}
                    </Row>
                    <Modal show={showRecap} onHide={() => setShowRecap(false)} centered size="xl">
                        <Modal.Header closeButton>
                            <Modal.Title id="contained-modal-title-vcenter" className="mx-auto">
                                Game Ended!
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="py-0 my-4">
                            <h5 className="text-center mb-4">{score == 0 ? "You didn't get any points this game, better luck next time!" : `You got ${score} points this game! You correctly guessed ${score == 5 ? `this meme:` : `these ${score / 5} memes:`}`}</h5>
                            <Row>
                                <Col className="d-flex justify-content-evenly">
                                    {guessedMemes.map((meme) => 
                                        <Card key={meme.memeID} className="ms-3">
                                            <Card.Img variant="top" src={meme.image} alt={meme.image} style={{height: "300px",  objectFit: "contain"}}/>
                                            <Card.Body>
                                                <Card.Text>
                                                    {meme.caption}
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    )}
                                </Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer className="d-flex justify-content-evenly">
                            <Link to="/" className="btn btn-primary">HOME</Link>
                            <Button className="btn btn-primary" onClick={props.startGame}>PLAY AGAIN</Button>
                        </Modal.Footer>
                    </Modal>
                </main>
            :
                <main className="col m-0 h-100">
                    <Row>
                        <Col className="d-flex justify-content-center">
                            <h1 className="mt-5">Loading game...</h1>
                        </Col>
                    </Row>
                </main>
            }
        </>
    );
};
