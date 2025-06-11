const express = require('express');
const path = require('path');
const { initializeBlockchain } = require('./init');

const {
    getAllTransactionsMempool,
    addTransactionMempool
} = require('../persistence/mempoolPersistence');
const { loadBlocks } = require('../persistence/blockPersistence');
const { getAllWallets, updateWalletBalance } = require('../persistence/walletPersistence');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize blockchain on startup
initializeBlockchain().then(() => {
    console.log('Genesis block created and saved.');

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, 'localhost', () => {
        console.log(`Blockchain server running at http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error('Failed to initialize blockchain:', error);
});

// POST /transaction — Add transaction
app.post('/transaction', async (req, res) => {
    try {
        const tx = req.body;

        // Basic validation
        if (!tx.sender || !tx.receiver || !tx.amount || !tx.fees) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if sender has sufficient balance
        const wallets = await getAllWallets();
        const senderWallet = wallets.find(w => w.address === tx.sender);

        if (!senderWallet || senderWallet.balance < (tx.amount + tx.fees)) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Add timestamp and ID
        tx.timestamp = Date.now();
        tx.id = require('crypto').createHash('sha256').update(JSON.stringify(tx)).digest('hex');

        await addTransactionMempool(tx);
        res.status(200).json({ message: 'Transaction added to mempool' });
    } catch (error) {
        console.error('Transaction error:', error);
        res.status(400).json({ error: 'Invalid transaction' });
    }
});

// GET /blockchain — Return all blocks
app.get('/blockchain', async (req, res) => {
    try {
        const blocks = await loadBlocks();
        res.json(blocks);
    } catch (error) {
        console.error('Error loading blocks:', error);
        res.status(500).json({ error: 'Failed to load blockchain' });
    }
});

// GET /mempool — Return all pending transactions
app.get('/mempool', async (req, res) => {
    try {
        const txs = await getAllTransactionsMempool();
        res.json(txs);
    } catch (error) {
        console.error('Error loading mempool:', error);
        res.status(500).json({ error: 'Failed to load mempool' });
    }
});

// GET /wallets — Return wallet balances
app.get('/wallets', async (req, res) => {
    try {
        const wallets = await getAllWallets();
        res.json(wallets);
    } catch (error) {
        console.error('Error loading wallets:', error);
        res.status(500).json({ error: 'Failed to load wallets' });
    }
});

// POST /mine — Manual mining trigger
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