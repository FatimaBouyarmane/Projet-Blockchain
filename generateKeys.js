const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function generateKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });

  const walletDir = path.join(__dirname, "client", "wallet");
  if (!fs.existsSync(walletDir)) {
    fs.mkdirSync(walletDir, { recursive: true });
  }

  fs.writeFileSync(path.join(walletDir, "private.pem"), privateKey);
  fs.writeFileSync(path.join(walletDir, "public.pem"), publicKey);

  console.log("Keys generated and saved to client/wallet/");
}

generateKeys();
