import { MemeDao } from './dao.mjs';

export default function Controller() {
    this.memeDao = new MemeDao();

    this.startGameOfRoundsAmount = async (roundsAmount) => {
        const game = await this.memeDao.generateGameID();
        game.rounds = await this.memeDao.getRandomMemesByAmount(roundsAmount);
        for (const round of game.rounds) {
            round.random_captions = await this.memeDao.getSevenRandomCaptionsByMeme(round.memeID);
            round.image = `http://localhost:3001/meme_images/${round.image}`;
        }
        //console.log(game);
        return game;
    };

    this.checkMatch = async (captionID, memeID) => {
        const match = {};
        match.correct = await this.memeDao.checkMatch(captionID, memeID);
        match.correct_captions = [];
        if (!match.correct) {
            match.correct_captions = await this.memeDao.getCorrectCaptionsByMeme(memeID);
        }
        return match;
    };

    this.saveGame = async (gameToSave, userID) => {
        await this.memeDao.saveGame(gameToSave.gameID, userID, gameToSave.score);
        for (const playedRound of gameToSave.gameOutcome) {
            await this.memeDao.saveRound(gameToSave.gameID, playedRound.memeID, playedRound.roundScore);
        }
    };

    this.getCorrectCaptionsByMeme = async (memeID) => {
        return await this.memeDao.getCorrectCaptionsByMeme(memeID);
    };

    this.getUserHistory = async (userID) => {
        const history = await this.memeDao.getGamesByUser(userID);
        for (const game of history) {
            game.rounds = await this.memeDao.getRoundsByGame(game.gameID);
            for (const round of game.rounds) {
                round.image = `http://localhost:3001/meme_images/${round.image}`;
            }
        }
        //console.log(history);
        return history;
    };
};
