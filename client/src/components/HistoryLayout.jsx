import { useEffect, useState } from 'react';
import { Alert, Row, Col, Card } from 'react-bootstrap';
import { Link } from "react-router-dom";
import API from '../API.mjs';

export default function HistoryLayout(props) {
    const [message, setMessage] = useState('');
    const [userHistory, setUserHistory] = useState(undefined);
    
    let loadedHistory = false;
    useEffect(() => {
        const loadHistory = async () => {
            try {
                let history = await API.fetchUserHistory();              
                setUserHistory(history);
                //console.log("History loaded");
            } catch (err) {
                setMessage({ msg: err.message, type: 'danger' });
            }
        };
        if (!loadedHistory) {
            loadHistory();
            loadedHistory = true;
        }
    }, []);


    return (
        <>
            {userHistory &&
            <main className="col m-0 h-100 overflow-y-auto">
                {props.message && <Row><Alert variant={props.message.type} onClose={() => props.setMessage('')} dismissible>{props.message.msg}</Alert></Row>}
                {message && <Row><Alert variant={message.type} onClose={() => setMessage('')} dismissible>{message.msg}</Alert></Row>}
                <h2 className="col my-5 text-center"> {`${props.user.username}, ${userHistory.length == 0 ? "once you start playing games they will be listed here!" : `you played ${userHistory.length} game${userHistory.length > 1 ? 's' : ''} so far!` }`}</h2>
                {userHistory.map((game) => 
                    <Row key={game.gameID} className="m-5 py-5 history-row">
                        {game.rounds.map((round) =>
                            <Col key={round.memeID} className="d-flex justify-content-center">
                                <Card key={round.memeID} className="ms-3">
                                    <Card.Img variant="top" src={round.image} alt={round.image} style={{height: "300px",  objectFit: "contain"}}/>
                                    <Card.Body className="d-flex justify-content-center">
                                        <Card.Text>
                                            {`Round Score: ${round.score}`}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )}
                        <Col className="d-flex justify-content-center align-items-center">
                            <h4>{`Total Game Score: ${game.total_score}`}</h4>
                        </Col>
                    </Row>
                )}
            </main>
            }
        </>
    );
};
