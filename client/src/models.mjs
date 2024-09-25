export function Round(memeID, image, score = 0, random_captions = []) {
    this.memeID = memeID;
    this.image = image;
    this.score = score;
    this.random_captions = random_captions;
}

export function Game(gameID, total_score = 0, rounds = []) {
    this.gameID = gameID;
    this.total_score = total_score;
    this.rounds = rounds;
}