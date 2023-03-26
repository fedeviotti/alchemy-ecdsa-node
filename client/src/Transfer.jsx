import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

const PRIVATE_KEYS = {
  fede: "a89583dd427ae112670a8862ef903771c2c4bfe2684dae2f3e5515686a4f38e5",
  rick: "eeaab3d2e5b4f925874061f4a3524bd58a51397ea263d0a6de901550e01ae156",
  gio: "5e3ed4ca7365b91e4379d80417ae3b9fd8f5983164f0218edb9fdc7444db84e1"
}

function hashMessage(message) {
  const bytes = utf8ToBytes(message);
  const hash = keccak256(bytes)
  return hash;
}

async function signMessage(msg) {
  const hash = hashMessage(msg);
  return secp.sign(hash, PRIVATE_KEYS.fede, {recovered: true})
}

function Transfer({ setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const message = `I am sending ${sendAmount} to ${recipient}`;
    const signature = await signMessage(message);

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
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
