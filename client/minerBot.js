// client/minerBot.js
const crypto = require("crypto");
const fetch = require("node-fetch");
const fs = require("fs");

const MINER_PUBLIC_KEY = fs.readFileSync("./wallet/public.pem", "utf8");
const BLOCK_REWARD = 50;

async function fetchData(endpoint) {
    const res = await fetch(`http://localhost:3000/${endpoint}`);
    return res.json();
}

function calculateHash(block) {
    const data = JSON.stringify({
        height: block.height,
        previousHash: block.previousHash,
        timestamp: block.timestamp,
        transactions: block.transactions,
        nonce: block.nonce,
        miner: block.miner
    });
    return crypto.createHash("sha256").update(data).digest("hex");
}

async function mineBlock() {
    console.log(" Mining started...");

    const blockchain = await fetchData("blockchain");
    const mempool = await fetchData("mempool");

    const previousBlock = blockchain[blockchain.length - 1];

    const height = previousBlock.height + 1;
    const previousHash = previousBlock.hash;
    const timestamp = Date.now();

    // Coinbase transaction (reward)
    const coinbaseTx = {
        sender: "coinbase",
        receiver: MINER_PUBLIC_KEY,
        amount: BLOCK_REWARD,
        fees: 0,
        signature: "coinbase"
    };

    const transactions = [coinbaseTx, ...mempool];

    let nonce = 0;
    let difficulty = previousBlock.difficulty || 3;
    let hash;

    // Proof-of-Work loop
    while (true) {
        const block = {
            height,
            previousHash,
            timestamp,
            transactions,
            nonce,
            miner: MINER_PUBLIC_KEY
        };

        hash = calculateHash(block);

        if (hash.startsWith("0".repeat(difficulty))) {
            block.hash = hash;
            console.log(" Block mined with hash:", hash);
            await submitBlock(block);
            break;
        }

        nonce++;
    }
}

async function submitBlock(block) {
    const res = await fetch("http://localhost:3000/mine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(block)
    });

    if (res.ok) {
        console.log(" Block submitted successfully!");
    } else {
        console.log(" Block submission failed.");
    }
}

// Run mining loop every X seconds (short for testing, 600s = 10 mins in real case)
setInterval(mineBlock, 30 * 1000); // mine every 30s
