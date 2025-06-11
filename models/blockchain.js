
class Blockchain {
    constructor(name, difficulty, miningInterval, blockReward, denom) {
        this.name = name;
        this.difficulty = difficulty;
        this.miningInterval = miningInterval;
        this.blockReward = blockReward;
        this.denom = denom;
        this.head = null;
    }
}

module.exports = Blockchain;
