const fetch = require("node-fetch"); 
const fs = require("fs");

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
