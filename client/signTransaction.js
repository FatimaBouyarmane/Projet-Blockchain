const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

// Load private and public keys
const privateKey = fs.readFileSync(path.join(__dirname, "wallet", "private.pem"), "utf8");
const publicKey = fs.readFileSync(path.join(__dirname, "wallet", "public.pem"), "utf8");

const senderAddress = crypto.createHash("sha256").update(publicKey).digest("hex");

// Create transaction objet
const tx = {
    sender: senderAddress,
    receiver: "04987cdef123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01",
    amount: 10,
    fees: 1
};

// Create SHA256 hash of transaction
const txString = JSON.stringify(tx);
const sign = crypto.createSign("SHA256");
sign.update(txString).end();

const signature = sign.sign(privateKey, "hex");

console.log("Signed Transaction:");
console.log(JSON.stringify({ ...tx, signature }, null, 2));
