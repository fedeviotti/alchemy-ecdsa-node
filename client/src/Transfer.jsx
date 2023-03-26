import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

export const USERS_KEYS = [{
    name: "Federico",
    publicKey: "64989cd89d40ce0bced1bcefa22b223d97b337be",
    privateKey: "a89583dd427ae112670a8862ef903771c2c4bfe2684dae2f3e5515686a4f38e5",
  }, {
    name: "Riccardo",
    publicKey: "bfa4825ade0609746269ddc17d1e5e656371bc3b",
    privateKey: "eeaab3d2e5b4f925874061f4a3524bd58a51397ea263d0a6de901550e01ae156",
  }, {
    name: "Giovanni",
    publicKey: "80dee9a0e8381528f2f52be13cbff2fe035a9d71",
    privateKey: "5e3ed4ca7365b91e4379d80417ae3b9fd8f5983164f0218edb9fdc7444db84e1",
  }
];

function hashMessage(message) {
  const bytes = utf8ToBytes(message);
  const hash = keccak256(bytes)
  return hash;
}

async function signMessage(msg, address) {
  const hash = hashMessage(msg);
  return secp.sign(
    hash,
    USERS_KEYS.find((user) => user.publicKey === address).privateKey,
    {recovered: true})
}

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const message = `I am sending ${sendAmount} to ${recipient}`;
    const signature = await signMessage(message, address);

    // By default, axios serializes JavaScript objects to JSON.
    // docs: https://axios-http.com/docs/urlencoded
    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        signature,
        amount: parseInt(sendAmount),
        recipient,
        message,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <select onChange={setValue(setRecipient)}>
          <option value="">Please choose an option</option>
          {USERS_KEYS.map((user) => {
            if (user.publicKey !== address) {
              return <option key={user.publicKey} value={user.publicKey}>{user.name}</option>
            }
          })}
        </select>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
