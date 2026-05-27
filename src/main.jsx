import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createWalletClient, custom, parseUnits } from "viem";
import { AGENT_PAYMENT_GUARD_ABI, CONTRACT_ADDRESS, MANTLE_SEPOLIA } from "./contract.js";
import { reviewPaymentIntent } from "./riskEngine.js";
import "./styles.css";

const DEFAULT_FORM = {
  agent: "0x000000000000000000000000000000000000A617",
  recipient: "0x1111111111111111111111111111111111111111",
  recipientLabel: "Demo vendor invoice",
  amount: "12.5",
  tokenSymbol: "MNT",
  purpose: "Pay a demo vendor invoice after AI agent approval",
};

function App() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [account, setAccount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [isWriting, setIsWriting] = useState(false);

  const review = useMemo(() => reviewPaymentIntent(form), [form]);
  const isConfigured = Boolean(CONTRACT_ADDRESS);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function connectWallet() {
    setError("");
    if (!window.ethereum) {
      setError("No injected wallet found. Install MetaMask or another EVM wallet.");
      return;
    }

    const [address] = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(address);
  }

  async function switchToMantleSepolia() {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x138b" }],
      });
    } catch (switchError) {
      if (switchError.code !== 4902) throw switchError;

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x138b",
            chainName: "Mantle Sepolia",
            nativeCurrency: MANTLE_SEPOLIA.nativeCurrency,
            rpcUrls: MANTLE_SEPOLIA.rpcUrls.default.http,
            blockExplorerUrls: [MANTLE_SEPOLIA.blockExplorers.default.url],
          },
        ],
      });
    }
  }

  async function recordReceipt() {
    setError("");
    setTxHash("");

    if (!isConfigured) {
      setError("Contract address is not configured yet. Deploy first, then set VITE_CONTRACT_ADDRESS.");
      return;
    }

    if (!account) {
      await connectWallet();
    }

    try {
      setIsWriting(true);
      await switchToMantleSepolia();

      const walletClient = createWalletClient({
        chain: MANTLE_SEPOLIA,
        transport: custom(window.ethereum),
      });

      const [walletAccount] = await walletClient.getAddresses();
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: AGENT_PAYMENT_GUARD_ABI,
        functionName: "recordPaymentIntent",
        account: walletAccount,
        args: [
          form.agent,
          form.recipient,
          parseUnits(form.amount || "0", 18),
          form.tokenSymbol,
          review.intentHash,
          review.score,
          review.summary,
        ],
      });

      setAccount(walletAccount);
      setTxHash(hash);
    } catch (writeError) {
      setError(writeError.shortMessage || writeError.message || "Transaction failed.");
    } finally {
      setIsWriting(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="brand">
          <img src="/logo.png" alt="Mantle Agent Payment Guard logo" />
          <div>
            <p className="eyebrow">AI DevTools on Mantle</p>
            <h1>Mantle Agent Payment Guard</h1>
          </div>
        </div>
        <p className="lead">
          Review AI-agent payment intent, surface risk signals, and record a
          compact payment-safety receipt on Mantle before value moves.
        </p>
        <div className="heroActions">
          <button onClick={connectWallet}>{account ? shortAddress(account) : "Connect wallet"}</button>
          <span className={isConfigured ? "pill ready" : "pill"}>{isConfigured ? "Contract configured" : "Local demo mode"}</span>
        </div>
      </section>

      <section className="workspace">
        <form className="panel">
          <div className="sectionTitle">
            <h2>Payment Intent</h2>
            <span>Agent request</span>
          </div>

          <label>
            Agent address
            <input value={form.agent} onChange={(event) => updateField("agent", event.target.value)} />
          </label>

          <label>
            Recipient address
            <input value={form.recipient} onChange={(event) => updateField("recipient", event.target.value)} />
          </label>

          <label>
            Recipient label
            <input value={form.recipientLabel} onChange={(event) => updateField("recipientLabel", event.target.value)} />
          </label>

          <div className="row">
            <label>
              Amount
              <input value={form.amount} onChange={(event) => updateField("amount", event.target.value)} />
            </label>
            <label>
              Token
              <input value={form.tokenSymbol} onChange={(event) => updateField("tokenSymbol", event.target.value)} />
            </label>
          </div>

          <label>
            Purpose
            <textarea value={form.purpose} onChange={(event) => updateField("purpose", event.target.value)} />
          </label>
        </form>

        <aside className="panel review">
          <div className="sectionTitle">
            <h2>AI Review</h2>
            <span>{review.level} risk</span>
          </div>

          <div className="scoreBlock">
            <div className="score">{review.score}</div>
            <div>
              <p>{review.summary}</p>
              <small>Intent hash: {shortHash(review.intentHash)}</small>
            </div>
          </div>

          <ul>
            {review.signals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>

          <button className="primary" onClick={recordReceipt} disabled={isWriting}>
            {isWriting ? "Recording..." : "Record safety receipt"}
          </button>

          {txHash && (
            <a className="tx" href={`https://explorer.sepolia.mantle.xyz/tx/${txHash}`} target="_blank" rel="noreferrer">
              View transaction {shortHash(txHash)}
            </a>
          )}

          {error && <p className="error">{error}</p>}
        </aside>
      </section>
    </main>
  );
}

function shortAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function shortHash(hash) {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

createRoot(document.getElementById("root")).render(<App />);

