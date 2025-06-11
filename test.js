

const Blockchain = require("./models/blockchain");
const { saveBlockchain, loadBlockchain } = require("./persistence/blockchainPersitence");

const testSave = () => {
    const blockchain = new Blockchain("Uemf", 6, 300, 50, "uemfCoin")
    saveBlockchain(blockchain)
        .then(() => console.log("blockchain saved with success"))
        .catch(e =>
            console.log("error on saving blockchain")
        )
}
const testLoad = async ()=>{
   try{
    const blockchain = await loadBlockchain()
    console.log(blockchain)
   }
   catch(e)
   {
    console.log(e)
   }
}
testLoad()