const crypto = require("crypto");
const fs = require("fs");

// Generate a wallet
function generateWallet() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
        namedCurve: "secp256k1",
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" }
    });

    fs.writeFileSync("private.pem", privateKey);
    fs.writeFileSync("public.pem", publicKey);

    console.log(" Wallet generated:");
    console.log(" Private key saved to private.pem");
    console.log(" Public key saved to public.pem");
}

function signTransaction(txPath = "tx.json") {
    const privateKey = fs.readFileSync("private.pem", "utf8");
    const tx = JSON.parse(fs.readFileSync(txPath));

    const txData = JSON.stringify({
        sender: tx.sender,
        receiver: tx.receiver,
        amount: tx.amount,
        fees: tx.fees
    });

    const sign = crypto.createSign("SHA256");
    sign.update(txData).end();

    const signature = sign.sign(privateKey, "hex");
    tx.signature = signature;

    console.log(" Transaction signed:");
    console.log(JSON.stringify(tx, null, 2));

    fs.writeFileSync("tx_signed.json", JSON.stringify(tx, null, 2));
    console.log(" Saved as tx_signed.json");
}

// CLI
const arg = process.argv[2];
if (arg === "gen") {
    generateWallet();
} else if (arg === "sign") {
    signTransaction(process.argv[3]); 
} else {
    console.log("Usage:");
    console.log("  node wallet.js gen       # generate new wallet");
    console.log("  node wallet.js sign tx.json  # sign tx file");
}
