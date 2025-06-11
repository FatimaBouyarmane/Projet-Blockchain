const crypto = require('crypto');

class Block {
    constructor(height, hash, previousHash, 
        timestamp, difficulty, blockReward,nonce,miner) {
        this.height=height
        this.hash=hash
        this.previousHash=previousHash
        this.timestamp=timestamp
        this.difficulty=difficulty
        this.blockReward=blockReward
        this.nonce=nonce
        this.miner = miner
        this.previousBlock = null
        this.blockchain = null
        this.transactions = []
    }

    calculateHash() {
        const data = JSON.stringify({
            height: this.height,
            previousHash: this.previousHash,
            timestamp: this.timestamp,
            transactions: this.transactions,
            nonce: this.nonce,
            miner: this.miner
        });
        return crypto.createHash('sha256').update(data).digest('hex');
    }
}
module.exports = Block