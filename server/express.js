const express = require('express');
const path = require('path');
const { 
    getAllTransactionsMempool, 
    addTransactionMempool 
} = require('../persistence/mempoolPersistence');
const { getAllWallets } = require('../persistence/walletPersistence');
const { getAllBlocks } = require('../persistence/blockPersistence');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// GET / — Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// GET /mempool — Return mempool transactions
app.get('/mempool', async (req, res) => {
    try {
        const txs = await getAllTransactionsMempool();
        res.json(txs);
    } catch (error) {
        console.error('Error fetching mempool:', error);
        res.status(500).json({ error: 'Failed to fetch mempool' });
    }
});

// POST /transaction — Add transaction to mempool
app.post("/transaction", async (req, res) => {
    try {
        const tx = req.body;

        // Basic validation
        if (!tx.sender || !tx.receiver || !tx.amount || tx.amount <= 0) {
            return res.status(400).json({ error: "Missing required fields or invalid amount" });
        }

        // Check if sender has sufficient balance
        const wallets = await getAllWallets();
        const senderWallet = wallets.find(w => w.address === tx.sender);

        if (!senderWallet || senderWallet.balance < (parseFloat(tx.amount) + parseFloat(tx.fees || 0))) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Add ID if not present
        if (!tx.id) {
            tx.id = 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        // Ensure transaction has a timestamp
        if (!tx.timestamp) {
            tx.timestamp = Date.now();
        }

        // Set default signature if missing
        if (!tx.signature) {
            tx.signature = "auto_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        }

        await addTransactionMempool(tx);
        console.log(`Transaction ${tx.id} added to mempool`);

        // Verify transaction was added
        const allTx = await getAllTransactionsMempool();
        console.log(`Mempool now contains ${allTx.length} transactions`);

        res.status(200).json({ 
            message: "Transaction added to mempool successfully",
            transaction: tx
        });
    } catch (error) {
        console.error("Error adding transaction:", error);
        res.status(500).json({ error: "Failed to add transaction" });
    }
});

// Get all wallets
app.get('/wallets', async (req, res) => {
    try {
        const wallets = await getAllWallets();
        res.json(wallets);
    } catch (error) {
        console.error('Error fetching wallets:', error);
        res.status(500).json({ error: 'Failed to fetch wallets' });
    }
});

// Get all blocks
app.get('/blocks', async (req, res) => {
    try {
        const blocks = await getAllBlocks();
        console.log(`Returning ${blocks.length} blocks`);
        res.json(blocks || []);
    } catch (error) {
        console.error('Error fetching blocks:', error);
        res.status(500).json({ error: 'Failed to fetch blocks', blocks: [] });
    }
});

// GET /blockchain — Return all blocks (alias for /blocks)
app.get('/blockchain', async (req, res) => {
    try {
        const blocks = await getAllBlocks();
        res.json(blocks);
    } catch (error) {
        console.error('Error loading blocks:', error);
        res.status(500).json({ error: 'Failed to load blockchain' });
    }
});

// POST /mine — Manual mining endpoint
app.post('/mine', async (req, res) => {
    try {
        const { mineBlock } = require('./minerLogic');
        const result = await mineBlock();
        res.json(result);
    } catch (error) {
        console.error('Mining error:', error);
        res.status(500).json({ error: 'Mining failed' });
    }
});

module.exports = app;