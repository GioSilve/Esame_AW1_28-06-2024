import { useState } from 'react';
import { Form, Button, Col, Alert, Row } from 'react-bootstrap';

export default function LoginForm(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        //console.log(username, password);
        const credentials = { username, password };
        props.login(credentials);
    };

    return (
        <Col md={6} className='mx-auto mt-5'>
            {props.message && <Row><Alert variant={props.message.type} onClose={() => props.setMessage('')} dismissible>{props.message.msg}</Alert></Row>}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId='username' className='mb-3 mt-5'>
                    <Form.Label><strong>Username</strong></Form.Label>
                    <Form.Control value={username} onChange={ev => setUsername(ev.target.value)} required={true} />
                </Form.Group>
                <Form.Group controlId='password'>
                    <Form.Label><strong>Password</strong></Form.Label>
                    <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} required={true} minLength={6} />
                </Form.Group>
                <Button type='submit' className="mt-5">LOGIN</Button>
            </Form>
        </Col>
    )
};
