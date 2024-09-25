import sqlite3 from "sqlite3";
import crypto from "crypto";
import { Game, Round } from './models.mjs';

// Opening the database
const db = new sqlite3.Database("./db.db", (err) => {
    if (err) throw err;
});

export function UserDao() {
    this.getUserIfValid = (username, password) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE username = ?';
            db.get(sql, [username], (err, row) => {
                if (err) { 
                    reject(err); 
                } else if (row === undefined) { 
                    resolve(false); 
                } else {
                    const user = { userID: row.userID, username: row.username };
                    crypto.scrypt(password, row.salt, 32, (err, hashedPassword) => {
                        if (err) {
                            reject(err);
                        } else if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword)) {
                            resolve(false);
                        } else {
                            resolve(user);
                        }
                    });
                }
            });
        });
    };

    this.getUserByUsername = (username) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT userID, username FROM users WHERE username = ?';
            db.get(sql, [username], (err, row) => {
                if (err) { 
                    reject(err); 
                } else if (row === undefined) { 
                    reject({error: "User not available, check the inserted username."}); 
                } else {
                    resolve(row);
                }
            });
        });
    };
};

export function MemeDao() {
    this.getRandomMemesByAmount = (amount) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM memes ORDER BY RANDOM() LIMIT ?';
            db.all(sql, [amount], (err, rows) => {
                if (err) { 
                    reject(err); 
                } else {
                    resolve(rows.map(row => new Round(row.memeID, row.image)));
                }
            });
        });
    };

    this.getSevenRandomCaptionsByMeme = (memeID) => {
        return new Promise((resolve, reject) => {
            const twoRandomMatchingCaptions = "SELECT captionID FROM matches WHERE memeID = ? ORDER BY RANDOM() LIMIT 2";
            const fiveRandomUnmatchingCaptions = "SELECT * FROM (SELECT captionID FROM captions EXCEPT SELECT captionID FROM matches WHERE memeID = ?) ORDER BY RANDOM() LIMIT 5";
            const sql = `SELECT * FROM captions WHERE captionID IN (SELECT * FROM (${twoRandomMatchingCaptions}) UNION SELECT * FROM (${fiveRandomUnmatchingCaptions})) ORDER BY RANDOM()`;
            db.all(sql, [memeID, memeID], (err, rows) => {
                if (err) { 
                    reject(err); 
                } else {
                    resolve(rows);
                }
            });
        });
    };

    this.generateGameID = () => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT COUNT(*) AS count FROM games';
            db.get(sql, (err, row) => {
                if (err) { 
                    reject(err); 
                } else {
                    resolve(new Game(row.count + 1));
                }
            });
        });
    };

    this.checkMatch = (captionID, memeID) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM matches WHERE captionID = ? AND memeID = ?';
            db.get(sql, [captionID, memeID], (err, row) => {
                if (err) { 
                    reject(err); 
                } else {
                    if (!row) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }
            });
        });
    };

    this.getCorrectCaptionsByMeme = (memeID) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT captionID FROM matches WHERE memeID = ?';
            db.all(sql, [memeID], (err, rows) => {
                if (err) { 
                    reject(err); 
                } else {
                    resolve(rows.map(row => row.captionID));
                }
            });
        });
    };

    this.saveGame = (gameID, userID, score) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO games (gameID, userID, total_score) VALUES (?, ?, ?)';
            db.run(sql, [gameID, userID, score], (err) => {
                if (err) { 
                    reject(err); 
                } else {
                    resolve();
                }
            });
        });
    };

    this.saveRound = (gameID, memeID, roundScore) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO rounds (gameID, memeID, score) VALUES (?, ?, ?)';
            db.run(sql, [gameID, memeID, roundScore], (err) => {
                if (err) { 
                    reject(err); 
                } else {
                    resolve();
                }
            });
        });
    };

    this.getGamesByUser = (userID) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT gameID, total_score FROM games WHERE userID = ?';
            db.all(sql, [userID], (err, rows) => {
                if (err) { 
                    reject(err); 
                } else {
                    resolve(rows.map(row => new Game(row.gameID, row.total_score)));
                }
            });
        });
    };

    this.getRoundsByGame = (gameID) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT rounds.memeID, image, score FROM rounds, memes WHERE rounds.memeID = memes.memeID AND gameID = ?';
            db.all(sql, [gameID], (err, rows) => {
                if (err) { 
                    reject(err); 
                } else {
                    resolve(rows.map(row => new Round(row.memeID, row.image, row.score)));
                }
            });
        });
    };
};
