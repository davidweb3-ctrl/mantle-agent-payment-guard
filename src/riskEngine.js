import { keccak256, stringToHex } from "viem";

const KNOWN_SAFE_PURPOSES = ["invoice", "subscription", "payroll", "grant", "demo"];
const RISKY_WORDS = ["urgent", "private key", "seed", "airdrop", "double", "guaranteed"];

export function reviewPaymentIntent(form) {
  const amount = Number(form.amount || 0);
  const lowerPurpose = `${form.purpose} ${form.recipientLabel}`.toLowerCase();
  const signals = [];
  let score = 20;

  if (amount <= 0) {
    score += 40;
    signals.push("Amount must be greater than zero.");
  }

  if (amount > 1000) {
    score += 35;
    signals.push("High amount for an automated agent payment.");
  } else if (amount > 100) {
    score += 18;
    signals.push("Medium amount: recommend a second review.");
  } else {
    signals.push("Small payment amount.");
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(form.recipient)) {
    score += 35;
    signals.push("Recipient address format is invalid.");
  } else {
    signals.push("Recipient address format is valid.");
  }

  if (KNOWN_SAFE_PURPOSES.some((word) => lowerPurpose.includes(word))) {
    score -= 10;
    signals.push("Purpose matches a normal business payment pattern.");
  }

  if (RISKY_WORDS.some((word) => lowerPurpose.includes(word))) {
    score += 25;
    signals.push("Purpose contains language often seen in risky requests.");
  }

  score = Math.max(1, Math.min(100, score));

  const level = score >= 70 ? "High" : score >= 40 ? "Medium" : "Low";
  const summary = `${level} risk (${score}/100): ${signals.slice(0, 3).join(" ")}`;
  const intentText = JSON.stringify({
    agent: form.agent,
    recipient: form.recipient,
    amount: form.amount,
    tokenSymbol: form.tokenSymbol,
    purpose: form.purpose,
  });

  return {
    level,
    score,
    summary: summary.slice(0, 280),
    signals,
    intentHash: keccak256(stringToHex(intentText)),
  };
}

