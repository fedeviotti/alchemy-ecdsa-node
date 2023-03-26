const { keccak256 } = require("ethereum-cryptography/keccak");
const secp = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

function getAddress(publicKey) {
  return keccak256(publicKey.slice(1)).slice(-20);
}

function hashMessage(message) {
  const bytes = utf8ToBytes(message);
  const hash = keccak256(bytes)
  return hash;
}

async function recoverKey(message, signature, recoveryBit) {
  return secp.recoverPublicKey(hashMessage(message), signature, recoveryBit);
}

const balances = {
  "64989cd89d40ce0bced1bcefa22b223d97b337be": 100, // Fede
  "bfa4825ade0609746269ddc17d1e5e656371bc3b": 50, // Rick
  "80dee9a0e8381528f2f52be13cbff2fe035a9d71": 75, // Gio
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  // get a signature from client side application
  // recover the public address from the signature
  // and that will be your sender
  const { signature: [sig, recoveryBit], recipient, amount  } = req.body;
  // console.log("body", sig, recoveryBit, recipient, amount);
  const publicKey = await recoverKey("Hello world", sig, recoveryBit);
  // console.log("publicKey", publicKey);
  const sender = toHex(getAddress(publicKey));

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
