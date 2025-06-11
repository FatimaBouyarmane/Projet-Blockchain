class Wallet {
    constructor(pkey = "") {
        this.pkey = pkey
        this.solde = 0
        this.sentTransactions= []
        this.receivedTransactions= []
        this.minedTransactions = []
    }
}
module.exports=Wallet