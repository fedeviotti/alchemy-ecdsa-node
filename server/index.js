const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

// Private keys
// a89583dd427ae112670a8862ef903771c2c4bfe2684dae2f3e5515686a4f38e5 // Fede
// eeaab3d2e5b4f925874061f4a3524bd58a51397ea263d0a6de901550e01ae156 // Rick
// 5e3ed4ca7365b91e4379d80417ae3b9fd8f5983164f0218edb9fdc7444db84e1 // Gio

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

app.post("/send", (req, res) => {
  // get a signature from client side application
  // recover the public address from the signature
  // and that will be your sender

  // setPrivateKey(privateKey);
  // const publicKey = secp.getPublicKey(privateKey);
  // const address = toHex(getAddress(publicKey));

  const { sender, recipient, amount } = req.body;

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
