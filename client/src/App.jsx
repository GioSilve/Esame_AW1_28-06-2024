import { useEffect, useState } from 'react';
import BaseLayout from './components/BaseLayout.jsx';
import HomeLayout from './components/HomeLayout.jsx';
import GameLayout from './components/GameLayout.jsx';
import HistoryLayout from './components/HistoryLayout.jsx';
import LoginForm from './components/LoginForm.jsx';
import { Route, Routes, Navigate} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import API from './API.mjs';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
    const navigate = useNavigate();
    const [loggedIn, setLoggedIn] = useState(false);
    const [message, setMessage] = useState('');
    const [user, setUser] = useState('');
    const [gameCounter, setGameCounter] = useState(0);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await API.getUserInfo();
                setLoggedIn(true);
                setUser(user);
            } catch (err) {
                console.log(err.error);
            }
        };
        checkAuth();
    }, []);

    const handleLogin = async (credentials) => {
        try {
            const user = await API.login(credentials);
            setLoggedIn(true);
            setUser(user);
            setMessage('');
        } catch (err) {
            setMessage({ msg: err, type: 'danger' });
        }
    };

    const handleLogout = async () => {
        try {
            await API.logout();
            setLoggedIn(false);
            setMessage('');
            navigate('/');
        } catch (err) {
            setMessage({ msg: err, type: 'danger' });
        }
    };

    const startGame = () => {
        setGameCounter(gameCounter => gameCounter + 1);
        navigate('/game');
    };

    return (
        <Routes>
            <Route path="/" element={<BaseLayout loggedIn={loggedIn} logout={handleLogout}/>}>
                <Route index element={<HomeLayout loggedIn={loggedIn} startGame={startGame} message={message} setMessage={setMessage} user={user}/>}/>
                <Route path="/game" element={<GameLayout key={gameCounter} loggedIn={loggedIn} message={message} setMessage={setMessage} startGame={startGame}/>}/>
                <Route path="/user/history" element={loggedIn ? <HistoryLayout message={message}  setMessage={setMessage} user={user}/> : <Navigate replace to="/login"/>}/>
                <Route path="/login" element={!loggedIn ? <LoginForm login={handleLogin} message={message} setMessage={setMessage}/> : <Navigate replace to="/"/>}/>
                <Route path="*" element={<Navigate replace to="/"/>}/>
            </Route>
        </Routes>
    )
}

export default App;
