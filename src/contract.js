export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";

export const MANTLE_SEPOLIA = {
  id: 5003,
  name: "Mantle Sepolia",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_MANTLE_SEPOLIA_RPC_URL || "https://rpc.sepolia.mantle.xyz"] },
    public: { http: [import.meta.env.VITE_MANTLE_SEPOLIA_RPC_URL || "https://rpc.sepolia.mantle.xyz"] },
  },
  blockExplorers: {
    default: { name: "Mantle Sepolia Explorer", url: "https://explorer.sepolia.mantle.xyz" },
  },
};

export const AGENT_PAYMENT_GUARD_ABI = [
  {
    type: "function",
    name: "recordPaymentIntent",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agent", type: "address" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "tokenSymbol", type: "string" },
      { name: "intentHash", type: "bytes32" },
      { name: "riskScore", type: "uint8" },
      { name: "riskSummary", type: "string" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
  },
  {
    type: "event",
    name: "PaymentIntentRecorded",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "agent", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "tokenSymbol", type: "string", indexed: false },
      { name: "intentHash", type: "bytes32", indexed: false },
      { name: "riskScore", type: "uint8", indexed: false },
      { name: "riskSummary", type: "string", indexed: false },
    ],
  },
];

