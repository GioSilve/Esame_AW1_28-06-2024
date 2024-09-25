import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { body, param, validationResult } from 'express-validator';
import { UserDao } from './dao.mjs';
import Controller from './controller.mjs';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';

const userDao = new UserDao();
const controller = new Controller();

// Initialization
const app = express();
const port = 3001;

// Middlewares
app.use(express.json());
app.use(morgan('dev'));
const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.static('public'));
app.use(session({
    secret: "A secret phrase",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

passport.use(new LocalStrategy(async function verify(username, password, callback) {
    const user = await userDao.getUserIfValid(username, password);
    if (!user)
        return callback(null, false, 'Invalid username and/or password.');
    return callback(null, user);
}));

passport.serializeUser(function (user, callback) {
    callback(null, user);
});

passport.deserializeUser(async function (user, callback) { 
    try {
        const usr = await userDao.getUserByUsername(user.username);
        callback(null, usr);
    } catch (err) {
        callback(err);
    }
});

const login = (req, res) => {
    return new Promise((resolve, reject) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                reject(err);
                return;
            }
            if (!user) {
                reject(info);
                return;
            }
            req.login(user, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(req.user);
            });
        })(req, res);
    });
};

const logout = (req) => {
    return new Promise((resolve, reject) => {
        req.logout(() => resolve(null));
    });
};

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ error: 'Not authorized' });
};

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let error = "The parameters are not formatted properly\n\n"
        errors.array().forEach((e) => {
            error += "- Parameter: " + e.param + " - Reason: " + e.msg + " - Location: " + e.location + "\n\n";
        })
        return res.status(422).json({ error: error });
    }
    return next();
};


/* ROUTES */
// POST /api/sessions
app.post('/api/sessions', 
    [body("username").isString().notEmpty(),
    body("password").isString().notEmpty()],
    validateRequest,
    async (req, res) => {
        try {
            const user = await login(req, res);
            return res.status(200).json(user);
        } catch (err) {
            return res.status(401).json(err);
        }
});

// DELETE /api/session/current
app.delete('/api/sessions/current', isLoggedIn, async (req, res) => {
    try {
        const user = await logout(req, res);
        return res.status(200).end();
    } catch (err) {
        return res.status(503).json(err);
    }
});

// GET /api/sessions/current
app.get('/api/sessions/current', isLoggedIn, async (req, res) => {
    res.status(200).json(req.user);
});

// GET /api/game/start/:roundsAmount
app.get('/api/game/start/:roundsAmount', param('roundsAmount').isInt().custom((value, { req }) => {
    if ((value == 3 && !req.isAuthenticated()) || (value == 1 && req.isAuthenticated())) {
        //console.log("Invalid rounds amount requested");
        throw new Error("Invalid rounds amount requested");
    }
    return true;
    }), validateRequest, (req, res) => {
    controller.startGameOfRoundsAmount(req.params.roundsAmount).then((game) => res.status(200).json(game)).catch((err) => res.status(500).json(err));
});

// GET /api/game/check/:captionID/:memeID
app.get('/api/game/check/:captionID/:memeID', param('captionID').isInt(), param('memeID').isInt(), validateRequest, (req, res) => {
    controller.checkMatch(req.params.captionID, req.params.memeID).then((match) => res.status(200).json(match)).catch((err) => res.status(500).json(err));
});

// GET /api/game/captions/:memeID
app.get('/api/game/captions/:memeID', param('memeID').isInt(), validateRequest, (req, res) => {
    controller.getCorrectCaptionsByMeme(req.params.memeID).then((correct_captions) => res.status(200).json(correct_captions)).catch((err) => res.status(500).json(err));
});

// POST api/game/results
app.post('/api/game/results', body("gameOutcome").isArray({ min: 3, max: 3}), body("score").isInt(), body("gameID").isInt(), validateRequest, isLoggedIn, (req, res) => {
    controller.saveGame(req.body, req.user.userID).then(() => res.status(200).end()).catch((err) => res.status(500).json(err));
});

// GET /api/user/history
app.get('/api/user/history', isLoggedIn, (req, res) => {
    controller.getUserHistory(req.user.userID).then((history) => res.status(200).json(history)).catch((err) => res.status(500).json(err));
});

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
