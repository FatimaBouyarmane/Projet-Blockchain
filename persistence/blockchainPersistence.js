
const fs = require('fs');
const path = require('path');
const Blockchain = require('../models/blockchain');

const BLOCKCHAIN_FILE = path.join(__dirname, '../database/blockchain.json');

const saveBlockchain = async (blockchain) => {
    try {
        const data = {
            name: blockchain.name,
            difficulty: blockchain.difficulty,
            miningInterval: blockchain.miningInterval,
            blockReward: blockchain.blockReward,
            denom: blockchain.denom,
            head: blockchain.head ? blockchain.head.hash : null
        };
        
        await fs.promises.writeFile(BLOCKCHAIN_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving blockchain:', error);
    }
};

const loadBlockchain = async () => {
    try {
        const data = await fs.promises.readFile(BLOCKCHAIN_FILE, 'utf8');
        const blockchainData = JSON.parse(data);
        
        const blockchain = new Blockchain(
            blockchainData.name,
            blockchainData.difficulty,
            blockchainData.miningInterval,
            blockchainData.blockReward,
            blockchainData.denom
        );
        
        // Load the head block if it exists
        if (blockchainData.head) {
            const { loadBlocks } = require('./blockPersistence');
            const blocks = await loadBlocks();
            blockchain.head = blocks.find(block => block.hash === blockchainData.head);
        }
        
        return blockchain;
    } catch (error) {
        console.error('Error loading blockchain:', error);
        return null;
    }
};

module.exports = { saveBlockchain, loadBlockchain };
