import { Game, Round } from './models.mjs';

const SERVER_URL = 'http://localhost:3001';

const login = async (credentials) => {
    const response = await fetch(SERVER_URL + '/api/sessions', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(credentials),
        credentials: 'include'
    });
    if (response.ok) {
        return await response.json();
    } else {
        throw await response.json();
    }
};

const logout = async () => {
    const response = await fetch(SERVER_URL + '/api/sessions/current', {
        method: 'DELETE',
        credentials: 'include'
    });
    if (response.ok) {
        return null;        
    } else {
        throw await response.json();
    }
}

const getUserInfo = async () => {
    const response = await fetch(SERVER_URL + '/api/sessions/current', {
        method: 'GET',
        credentials: 'include'
    });
    if (response.ok) {
        return await response.json();
    } else {
        throw await response.json();
    }
}

const fetchstartGame = async (roundsAmount) => {
    const response = await fetch(`${SERVER_URL}/api/game/start/${roundsAmount}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });
    if (response.ok) {
        const gameJson = await response.json();
        gameJson.rounds = gameJson.rounds.map((round) => new Round(round.memeID, round.image, 0, round.random_captions));
        return new Game(gameJson.gameID, 0, gameJson.rounds);
    }
    throw new Error(`Cannot start new game: status ${response.status}: ${response.statusText}`);
}

const fetchCheckMatch = async (captionID, memeID) => {
    const response = await fetch(`${SERVER_URL}/api/game/check/${captionID}/${memeID}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });
    if (response.ok) {
        return await response.json();
    }
    throw new Error(`Cannot check match: status ${response.status}: ${response.statusText}`);
}

const fetchSaveGame = async (gameOutcome, score, gameID) => {
    const response = await fetch(SERVER_URL + '/api/game/results', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({gameOutcome, score, gameID}),
        credentials: 'include'
    });
    if (response.ok) {
        return null;
    }
    throw new Error(`Cannot save game: status ${response.status}: ${response.statusText}`);
}

const fetchGetCorrectCaptionsByMeme = async (memeID) => {
    const response = await fetch(`${SERVER_URL}/api/game/captions/${memeID}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });
    if (response.ok) {
        return await response.json();
    }
    throw new Error(`Cannot get correct captions: status ${response.status}: ${response.statusText}`);
}

const fetchUserHistory = async () => {
    const response = await fetch(`${SERVER_URL}/api/user/history`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });
    if (response.ok) {
        const historyJson = await response.json();
        historyJson.forEach((game) => game.rounds = game.rounds.map((round) => new Round(round.memeID, round.image, 0)));
        return historyJson.map((game) => new Game(game.gameID, game.total_score, game.rounds));
    }
    throw new Error(`Cannot get user history: status ${response.status}: ${response.statusText}`);
}

const API = { login, logout, getUserInfo, fetchstartGame, fetchCheckMatch, 
            fetchSaveGame, fetchGetCorrectCaptionsByMeme, fetchUserHistory };
export default API;