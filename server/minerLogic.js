
const { getAllTransactionsMempool, clearMempool } = require('../persistence/mempoolPersistence');
const { saveBlock, getAllBlocks } = require('../persistence/blockPersistence');
const { updateWalletBalance, getAllWallets } = require('../persistence/walletPersistence');
const Block = require('../models/block');
const crypto = require('crypto');

const DIFFICULTY = 4; // Number of leading zeros required
const BLOCK_REWARD = 50;

const mineBlock = async () => {
    try {
        console.log('Starting mining process...');
        
        // Get pending transactions
        const pendingTransactions = await getAllTransactionsMempool();
        console.log(`Found ${pendingTransactions.length} pending transactions`);
        
        // Get current blockchain state
        const blocks = await getAllBlocks();
        const sortedBlocks = blocks.sort((a, b) => (a.height || 0) - (b.height || 0));
        const lastBlock = sortedBlocks[sortedBlocks.length - 1];
        
        const newHeight = lastBlock ? (lastBlock.height || 0) + 1 : 1;
        const previousHash = lastBlock ? lastBlock.hash : "000000genesis";
        
        // Validate transactions and check balances
        const validTransactions = await validateTransactions(pendingTransactions);
        console.log(`${validTransactions.length} valid transactions selected for mining`);
        
        // Add coinbase transaction (mining reward)
        const coinbaseTransaction = {
            id: `coinbase_${Date.now()}`,
            sender: null,
            receiver: "system_miner",
            amount: BLOCK_REWARD,
            fees: 0,
            timestamp: Date.now(),
            type: "coinbase"
        };
        
        const allTransactions = [coinbaseTransaction, ...validTransactions];
        
        // Create new block
        const newBlock = new Block(
            newHeight,
            '', // hash will be calculated during mining
            previousHash,
            Date.now(),
            DIFFICULTY,
            BLOCK_REWARD,
            0, // nonce starts at 0
            "system_miner"
        );
        
        newBlock.transactions = allTransactions;
        
        // Mine the block (Proof of Work)
        console.log('Starting proof of work...');
        const minedBlock = await proofOfWork(newBlock);
        
        // Save the block
        await saveBlock(minedBlock);
        console.log(`Block #${minedBlock.height} mined successfully with hash: ${minedBlock.hash}`);
        
        // Update wallet balances
        await updateWalletBalances(allTransactions);
        
        // Clear processed transactions from mempool
        await clearMempool();
        
        return {
            success: true,
            block: minedBlock,
            message: `Block #${minedBlock.height} mined successfully`
        };
        
    } catch (error) {
        console.error('Mining error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const validateTransactions = async (transactions) => {
    const wallets = await getAllWallets();
    const validTransactions = [];
    const walletBalances = {};
    
    // Initialize wallet balances
    wallets.forEach(wallet => {
        walletBalances[wallet.address] = wallet.balance;
    });
    
    for (const tx of transactions) {
        // Skip transactions without required fields
        if (!tx.sender || !tx.receiver || !tx.amount) {
            console.log(`Skipping invalid transaction: ${tx.id}`);
            continue;
        }
        
        // Check if sender has sufficient balance
        const senderBalance = walletBalances[tx.sender] || 0;
        const totalRequired = parseFloat(tx.amount) + parseFloat(tx.fees || 0);
        
        if (senderBalance >= totalRequired) {
            validTransactions.push(tx);
            walletBalances[tx.sender] -= totalRequired;
            console.log(`Transaction ${tx.id} validated`);
        } else {
            console.log(`Transaction ${tx.id} rejected: insufficient funds`);
        }
    }
    
    return validTransactions;
};

const proofOfWork = async (block) => {
    const target = "0".repeat(DIFFICULTY);
    let nonce = 0;
    
    while (true) {
        block.nonce = nonce;
        const blockData = {
            height: block.height,
            previousHash: block.previousHash,
            timestamp: block.timestamp,
            transactions: block.transactions,
            nonce: block.nonce
        };
        
        const hash = crypto.createHash('sha256')
            .update(JSON.stringify(blockData))
            .digest('hex');
        
        if (hash.substring(0, DIFFICULTY) === target) {
            block.hash = hash;
            console.log(`Block mined! Nonce: ${nonce}, Hash: ${hash}`);
            break;
        }
        
        nonce++;
        
        // Log progress every 10000 attempts
        if (nonce % 10000 === 0) {
            console.log(`Mining attempt ${nonce}...`);
        }
    }
    
    return block;
};

const updateWalletBalances = async (transactions) => {
    for (const tx of transactions) {
        // Handle coinbase transaction
        if (tx.type === 'coinbase') {
            await updateWalletBalance(tx.receiver, parseFloat(tx.amount), 'add');
            continue;
        }
        
        // Handle regular transactions
        if (tx.sender && tx.receiver) {
            // Deduct from sender (amount + fees)
            const totalDeduction = parseFloat(tx.amount) + parseFloat(tx.fees || 0);
            await updateWalletBalance(tx.sender, totalDeduction, 'subtract');
            
            // Add to receiver (only amount, fees go to miner)
            await updateWalletBalance(tx.receiver, parseFloat(tx.amount), 'add');
            
            // Add fees to miner (if not coinbase)
            if (tx.fees > 0) {
                await updateWalletBalance('system_miner', parseFloat(tx.fees), 'add');
            }
        }
    }
};

module.exports = {
    mineBlock,
    validateTransactions,
    proofOfWork
};
