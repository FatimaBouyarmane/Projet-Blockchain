
const fs = require('fs');
const path = require('path');
const Block = require('../models/block');
const Blockchain = require('../models/blockchain');
const { saveBlock } = require('../persistence/blockPersistence');
const { saveBlockchain } = require('../persistence/blockchainPersistence');
const { createWallet } = require('../persistence/walletPersistence');

const initializeBlockchain = async () => {
    try {
        // Ensure directories exist
        const blockDir = path.join(__dirname, '../database/blocks');
        if (!fs.existsSync(blockDir)) {
            fs.mkdirSync(blockDir, { recursive: true });
        }
        
        // Check if genesis block already exists
        const genesisFile = path.join(blockDir, '0.json');
        if (fs.existsSync(genesisFile)) {
            console.log('Genesis block already exists');
            return;
        }
        
        // Create blockchain configuration
        const blockchain = new Blockchain(
            "uemfBlockchain",
            6, // difficulty
            600, // mining interval (10 minutes)
            50, // block reward
            "uemfCoin" // denomination
        );
        
        // Create genesis block
        const genesisBlock = new Block(
            0, // height
            "000000genesis", // hash
            null, // previous hash
            Date.now(), // timestamp
            6, // difficulty
            50, // block reward
            0, // nonce
            "genesis" // miner
        );
        
        genesisBlock.transactions = [{
            id: "genesis",
            sender: null,
            receiver: "genesis",
            amount: 1000000,
            fees: 0,
            timestamp: Date.now(),
            type: "genesis"
        }];
        
        // Save genesis block
        await saveBlock(genesisBlock);
        
        // Set blockchain head to genesis block
        blockchain.head = genesisBlock;
        await saveBlockchain(blockchain);
        
        // Create some initial wallets
        await createWallet("genesis", 1000000);
        await createWallet("system_miner", 0);
        await createWallet("user1", 100);
        await createWallet("user2", 100);
        
        console.log('Blockchain initialized with genesis block');
        
    } catch (error) {
        console.error('Error initializing blockchain:', error);
        throw error;
    }
};

module.exports = { initializeBlockchain };
