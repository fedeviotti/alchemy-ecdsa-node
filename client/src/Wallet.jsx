import server from "./server";
import {USERS_KEYS} from "./Transfer.jsx";

function Wallet({ setAddress, balance, setBalance }) {
  async function onChange(evt) {
    const address = evt.target.value;
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <select onChange={onChange}>
          <option value="">Please choose an option</option>
          {USERS_KEYS.map((user) => {
            return <option key={user.publicKey} value={user.publicKey}>{user.name}</option>
          })}
        </select>
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
