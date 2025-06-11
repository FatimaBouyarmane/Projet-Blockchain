class Mempool {
    constructor() {
        this.transactions = []
    }

    addTransaction(tx) {
        this.transactions.push(tx)
    }

    removeTransaction(signature) {
        this.transactions = this.transactions.filter(t => t.signature !== signature)
    }

    getTransactions() {
        return this.transactions
    }

    clear() {
        this.transactions = []
    }
}

module.exports = Mempool
