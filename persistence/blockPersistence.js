const pathFolder = "database/blocks";
const fs = require("fs");
const Block = require("../models/block");
const { loadBlockchain } = require("./blockchainPersistence");
const path = require('path');

const loadBlocks = async () => {
    try {
        const blockDir = path.join(__dirname, '../database/blocks');
        const files = await fs.promises.readdir(blockDir);

        // Filter only JSON files and sort by block number
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        const blocks = [];
        for (const file of jsonFiles.sort((a, b) => parseInt(a) - parseInt(b))) {
            try {
                const blockData = await fs.promises.readFile(path.join(blockDir, file), 'utf8');
                const dataFile = JSON.parse(blockData);

                let blockchain = await loadBlockchain();

                let block = new Block(
                    dataFile.height,
                    dataFile.hash,
                    dataFile.previousHash,
                    dataFile.timestamp,
                    dataFile.difficulty,
                    dataFile.blockReward,
                    dataFile.nonce,
                    dataFile.miner
                );

                blocks.push(block);
                block.blockchain = blockchain;
                if (block.height != 0)
                    block.previousBlock = blocks[blocks.length - 2];
                block.transactions = dataFile.transactions || [];
            } catch (parseError) {
                console.error(`Error parsing block file ${file}:`, parseError);
            }
        }

        return blocks;
    } catch (error) {
        console.error('Error loading blocks:', error);
        return [];
    }
};

const saveBlock = async (block) => {
    try {
        const blockData = {
            height: block.height,
            hash: block.hash,
            previousHash: block.previousHash,
            timestamp: block.timestamp,
            difficulty: block.difficulty,
            blockReward: block.blockReward,
            nonce: block.nonce,
            miner: block.miner,
            transactions: block.transactions
        };

        await fs.promises.writeFile(
            `${pathFolder}/${block.height}.json`,
            JSON.stringify(blockData, null, 2)
        );
    } catch (error) {
        console.error("Error saving block:", error);
    }
};

const getBlock = async (hash) => {
    try {
        const blocks = await loadBlocks();
        return blocks.find(block => block.hash === hash);
    } catch (error) {
        console.error("Error getting block:", error);
        return null;
    }
};

const getAllBlocks = async () => {
    try {
        const blockDir = path.join(__dirname, '../database/blocks');
        if (!fs.existsSync(blockDir)) {
            fs.mkdirSync(blockDir, { recursive: true });
            return [];
        }

        const files = await fs.promises.readdir(blockDir);
        const blocks = [];

        for (const file of files) {
            if (file.endsWith('.json')) {
                try {
                    const filePath = path.join(blockDir, file);
                    const data = await fs.promises.readFile(filePath, 'utf8');
                    const block = JSON.parse(data);
                    blocks.push(block);
                } catch (err) {
                    console.error(`Error reading block file ${file}:`, err);
                }
            }
        }

        return blocks.sort((a, b) => (a.height || 0) - (b.height || 0));
    } catch (error) {
        console.error('Error loading all blocks:', error);
        return [];
    }
};

module.exports = { loadBlocks, saveBlock, getBlock, getAllBlocks };