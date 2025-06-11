
const fs = require('fs');
const path = require('path');

const WALLETS_FILE = path.join(__dirname, '../database/wallets.json');

const getAllWallets = async () => {
    try {
        if (!fs.existsSync(WALLETS_FILE)) {
            return [];
        }
        const data = await fs.promises.readFile(WALLETS_FILE, 'utf8');
        return JSON.parse(data) || [];
    } catch (error) {
        console.error('Error loading wallets:', error);
        return [];
    }
};

const createWallet = async (address, initialBalance = 0) => {
    try {
        const wallets = await getAllWallets();
        
        // Check if wallet already exists
        const existingWallet = wallets.find(w => w.address === address);
        if (existingWallet) {
            console.log(`Wallet ${address} already exists`);
            return existingWallet;
        }
        
        const newWallet = {
            address,
            balance: initialBalance
        };
        
        wallets.push(newWallet);
        await fs.promises.writeFile(WALLETS_FILE, JSON.stringify(wallets, null, 2));
        
        console.log(`Wallet created: ${address} with balance ${initialBalance}`);
        return newWallet;
    } catch (error) {
        console.error('Error creating wallet:', error);
        throw error;
    }
};

const updateWalletBalance = async (address, amount, operation = 'add') => {
    try {
        const wallets = await getAllWallets();
        let wallet = wallets.find(w => w.address === address);
        
        if (!wallet) {
            // Create wallet if it doesn't exist
            wallet = await createWallet(address, 0);
            return await updateWalletBalance(address, amount, operation);
        }
        
        const currentBalance = parseFloat(wallet.balance || 0);
        const changeAmount = parseFloat(amount);
        
        if (operation === 'add') {
            wallet.balance = currentBalance + changeAmount;
        } else if (operation === 'subtract') {
            wallet.balance = Math.max(0, currentBalance - changeAmount);
        }
        
        // Update the wallets array
        const walletIndex = wallets.findIndex(w => w.address === address);
        if (walletIndex !== -1) {
            wallets[walletIndex] = wallet;
        }
        
        await fs.promises.writeFile(WALLETS_FILE, JSON.stringify(wallets, null, 2));
        
        console.log(`Wallet ${address} balance updated: ${currentBalance} -> ${wallet.balance}`);
        return wallet;
    } catch (error) {
        console.error('Error updating wallet balance:', error);
        throw error;
    }
};

const getWalletBalance = async (address) => {
    try {
        const wallets = await getAllWallets();
        const wallet = wallets.find(w => w.address === address);
        return wallet ? wallet.balance : 0;
    } catch (error) {
        console.error('Error getting wallet balance:', error);
        return 0;
    }
};

module.exports = {
    getAllWallets,
    createWallet,
    updateWalletBalance,
    getWalletBalance
};
