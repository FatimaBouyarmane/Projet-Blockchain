
class BlockchainDashboard {
    constructor() {
        this.baseUrl = '';
        this.init();
        this.startPolling();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('transactionForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.sendTransaction();
        });
        
        // Adding manual mine button after the transaction section
        const mineButton = document.createElement('button');
        mineButton.textContent = 'Mine Block';
        mineButton.onclick = () => this.mineBlock();
        mineButton.style.padding = '12px 24px';
        mineButton.style.backgroundColor = '#28a745';
        mineButton.style.color = 'white';
        mineButton.style.border = 'none';
        mineButton.style.borderRadius = '8px';
        mineButton.style.cursor = 'pointer';
        mineButton.style.fontSize = '16px';
        mineButton.style.fontWeight = '600';
        mineButton.style.marginTop = '20px';
        mineButton.className = 'btn btn-mine';
        
        // Insert after transaction section
        const transactionSection = document.querySelector('.section');
        transactionSection.parentNode.insertBefore(mineButton, transactionSection.nextSibling);
    }

    async loadData() {
        try {
            const [blocks, mempool, wallets] = await Promise.all([
                this.loadBlocks(),
                this.loadMempool(),
                this.loadWallets()
            ]);
            this.updateStats(blocks, mempool);
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load blockchain data');
        }
    }

    async loadBlocks() {
        try {
            const response = await fetch(`${this.baseUrl}/blocks`);
            if (!response.ok) throw new Error('Failed to fetch blocks');
            const blocks = await response.json();
            this.displayBlocks(blocks);
            return blocks;
        } catch (error) {
            console.error('Error loading blocks:', error);
            this.displayBlocks([]);
            return [];
        }
    }

    async loadMempool() {
        try {
            const response = await fetch(`${this.baseUrl}/mempool`);
            if (!response.ok) throw new Error('Failed to fetch mempool');
            const transactions = await response.json();
            this.displayMempool(transactions);
            return transactions;
        } catch (error) {
            console.error('Error loading mempool:', error);
            this.displayMempool([]);
            return [];
        }
    }

    async loadWallets() {
        try {
            const response = await fetch(`${this.baseUrl}/wallets`);
            if (!response.ok) throw new Error('Failed to fetch wallets');
            const wallets = await response.json();
            this.displayWallets(wallets);
            this.populateAddressOptions(wallets);
            return wallets;
        } catch (error) {
            console.error('Error loading wallets:', error);
            this.displayWallets([]);
            return [];
        }
    }

    displayBlocks(blocks) {
        const container = document.getElementById('blocksContainer');
        if (!blocks || blocks.length === 0) {
            container.innerHTML = '<p class="no-data">No blocks found</p>';
            return;
        }

        const sortedBlocks = blocks.sort((a, b) => (a.height || 0) - (b.height || 0));
        
        container.innerHTML = sortedBlocks.map(block => `
            <div class="block-card">
                <h4>Block #${block.height || 0}</h4>
                <p><strong>Hash:</strong> ${block.hash || 'N/A'}</p>
                <p><strong>Previous Hash:</strong> ${block.previousHash || 'N/A'}</p>
                <p><strong>Timestamp:</strong> ${new Date(block.timestamp).toLocaleString()}</p>
                <p><strong>Nonce:</strong> ${block.nonce || 0}</p>
                <p><strong>Miner:</strong> ${block.miner || 'Unknown'}</p>
                <p><strong>Transactions:</strong> ${block.transactions ? block.transactions.length : 0}</p>
                ${block.transactions && block.transactions.length > 0 ? `
                    <div class="transactions">
                        <h5>Transactions:</h5>
                        ${block.transactions.map(tx => `
                            <div class="transaction">
                                <p><strong>ID:</strong> ${tx.id || 'N/A'}</p>
                                <p><strong>From:</strong> ${tx.sender || 'N/A'}</p>
                                <p><strong>To:</strong> ${tx.receiver || 'N/A'}</p>
                                <p><strong>Amount:</strong> ${tx.amount || 0} uemfCoin</p>
                                <p><strong>Fees:</strong> ${tx.fees || 0} uemfCoin</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    displayMempool(transactions) {
        const container = document.getElementById('mempoolContainer');
        if (!transactions || transactions.length === 0) {
            container.innerHTML = '<p class="no-data">No pending transactions</p>';
            return;
        }

        container.innerHTML = transactions.map(tx => `
            <div class="transaction-card">
                <p><strong>ID:</strong> ${tx.id || 'N/A'}</p>
                <p><strong>From:</strong> ${tx.sender || 'N/A'}</p>
                <p><strong>To:</strong> ${tx.receiver || 'N/A'}</p>
                <p><strong>Amount:</strong> ${tx.amount || 0} uemfCoin</p>
                <p><strong>Fees:</strong> ${tx.fees || 0} uemfCoin</p>
                <p><strong>Time:</strong> ${tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'N/A'}</p>
                <p><strong>Signature:</strong> ${tx.signature ? 'Present' : 'Missing'}</p>
            </div>
        `).join('');
    }

    displayWallets(wallets) {
        const container = document.getElementById('walletsContainer');
        if (!wallets || wallets.length === 0) {
            container.innerHTML = '<p class="no-data">No wallets found</p>';
            return;
        }

        container.innerHTML = wallets.map(wallet => `
            <div class="wallet-card">
                <p><strong>Address:</strong> ${wallet.address}</p>
                <p><strong>Balance:</strong> ${wallet.balance || 0} uemfCoin</p>
            </div>
        `).join('');
    }

    populateAddressOptions(wallets) {
        const senderSelect = document.getElementById('sender');
        const receiverDropdown = document.getElementById('receiverDropdown');
        
        if (!senderSelect || !receiverDropdown) return;

        const options = wallets.map(wallet => 
            `<option value="${wallet.address}">${wallet.address.substring(0, 20)}... (${wallet.balance} uemfCoin)</option>`
        ).join('');

        senderSelect.innerHTML = '<option value="">Select sender address</option>' + options;
        receiverDropdown.innerHTML = '<option value="">-- Or select from existing wallets --</option>' + options;
    }

    async sendTransaction() {
        const sender = document.getElementById('sender').value;
        const receiver = document.getElementById('receiver').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const fees = parseFloat(document.getElementById('fees').value) || 1;

        if (!sender || !receiver || !amount || amount <= 0) {
            this.showError('Please fill all required fields with valid values');
            return;
        }

        if (sender === receiver) {
            this.showError('Sender and receiver cannot be the same');
            return;
        }

        // Auto-generate signature using crypto utilities
        const txData = { sender, receiver, amount, fees };
        const signature = await CryptoUtils.generateSignature(txData);

        const transaction = {
            sender,
            receiver,
            amount,
            fees,
            signature,
            timestamp: Date.now()
        };

        try {
            // Send transaction
            const response = await fetch(`${this.baseUrl}/transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transaction)
            });

            const result = await response.json();

            if (response.ok) {
                this.showSuccess('Transaction sent successfully!');
                document.getElementById('transactionForm').reset();
                await this.loadData(); // Refresh data to show transaction in mempool
            } else {
                this.showError(result.error || 'Failed to send transaction');
            }
        } catch (error) {
            console.error('Transaction error:', error);
            this.showError('Failed to send transaction');
        }
    }

    

    async mineBlock() {
        try {
            this.showInfo('Mining block... Please wait.');
            const response = await fetch(`${this.baseUrl}/mine`, {
                method: 'POST'
            });

            const result = await response.json();

            if (response.ok) {
                this.showSuccess('Block mined successfully!');
                await this.loadData(); // Refresh data
            } else {
                this.showError(result.error || 'Mining failed');
            }
        } catch (error) {
            console.error('Mining error:', error);
            this.showError('Mining failed');
        }
    }

    updateStats(blocks, mempool) {
        document.getElementById('blockCount').textContent = blocks.length;
        document.getElementById('pendingTxCount').textContent = mempool.length;
        document.getElementById('lastUpdate').textContent = new Date().toLocaleString();
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showInfo(message) {
        this.showMessage(message, 'info');
    }

    showMessage(message, type) {
        // Create or update message element
        let messageEl = document.getElementById('message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'message';
            messageEl.style.position = 'fixed';
            messageEl.style.top = '20px';
            messageEl.style.right = '20px';
            messageEl.style.padding = '10px 20px';
            messageEl.style.borderRadius = '4px';
            messageEl.style.zIndex = '1000';
            messageEl.style.fontWeight = 'bold';
            document.body.appendChild(messageEl);
        }

        messageEl.textContent = message;
        messageEl.className = `message ${type}`;

        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    }

    startPolling() {
        // Refresh data every 30 seconds
        setInterval(() => {
            this.loadData();
        }, 30000);
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new BlockchainDashboard();
});
