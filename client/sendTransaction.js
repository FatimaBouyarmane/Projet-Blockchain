// client/sendTransaction.js
const fetch = require("node-fetch"); // npm install node-fetch@2
const fs = require("fs");

// Load signed tx JSON (e.g., copy-paste from signTransaction)
const tx = JSON.parse(fs.readFileSync("signedTx.json", "utf8")); // Save manually after signing

fetch("http://localhost:3000/transaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tx),
})
.then(res => {
    if (res.ok) {
        console.log("Transaction sent successfully!");
    } else {
        console.log("Transaction failed.");
    }
})
.catch(err => console.error("Error:", err));
