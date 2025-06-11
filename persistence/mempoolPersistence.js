
const fs = require('fs');
const path = require('path');

const MEMPOOL_FILE = path.join(__dirname, '../database/mempool.json');

const getAllTransactionsMempool = async () => {
    try {
        if (!fs.existsSync(MEMPOOL_FILE)) {
            await fs.promises.writeFile(MEMPOOL_FILE, '[]');
            return [];
        }
        
        const data = await fs.promises.readFile(MEMPOOL_FILE, 'utf8');
        const trimmedData = data.trim();
        
        if (!trimmedData || trimmedData === '') {
            await fs.promises.writeFile(MEMPOOL_FILE, '[]');
            return [];
        }
        
        return JSON.parse(trimmedData);
    } catch (error) {
        console.error('Error loading mempool:', error);
        // Reset corrupted file
        await fs.promises.writeFile(MEMPOOL_FILE, '[]');
        return [];
    }
};

const addTransactionMempool = async (transaction) => {
    try {
        let transactions = await getAllTransactionsMempool();
        transactions.push(transaction);
        await fs.promises.writeFile(MEMPOOL_FILE, JSON.stringify(transactions, null, 2));
    } catch (error) {
        console.error('Error adding transaction to mempool:', error);
    }
};

const removeTransactionMempool = async (transactionId) => {
    try {
        let transactions = await getAllTransactionsMempool();
        transactions = transactions.filter(tx => tx.id !== transactionId);
        await fs.promises.writeFile(MEMPOOL_FILE, JSON.stringify(transactions, null, 2));
    } catch (error) {
        console.error('Error removing transaction from mempool:', error);
    }
};

const clearMempool = async () => {
    try {
        await fs.promises.writeFile(MEMPOOL_FILE, JSON.stringify([], null, 2));
    } catch (error) {
        console.error('Error clearing mempool:', error);
    }
};

module.exports = { 
    getAllTransactionsMempool, 
    addTransactionMempool, 
    removeTransactionMempool, 
    clearMempool 
};
