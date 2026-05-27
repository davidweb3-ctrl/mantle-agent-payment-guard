import { execFileSync } from "node:child_process";
import { mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const outDir = join(root, "demo", "rendered");
const slideDir = join(outDir, "slides");
mkdirSync(slideDir, { recursive: true });

const slides = [
  {
    file: "slide-01-title.png",
    duration: 15,
    title: "Mantle Agent Payment Guard",
    eyebrow: "AI DevTools on Mantle",
    body: "An onchain receipt system for AI-agent payment safety.",
    notes: ["Pre-payment review", "Risk summary", "User authorization proof", "Mantle Sepolia receipt"],
  },
  {
    file: "slide-02-problem.png",
    duration: 20,
    title: "The Problem",
    eyebrow: "AI agents can trigger payments",
    body: "After an agent acts, teams need proof of what the user saw, what the agent intended, and whether the risk was approved.",
    notes: ["Payments", "Subscriptions", "Swaps", "Treasury actions"],
  },
  {
    file: "slide-03-flow.png",
    duration: 20,
    title: "Safety Flow",
    eyebrow: "Not a payment contract",
    body: "The project records a reviewed payment intent before a payment action is executed.",
    notes: ["AI payment intent", "Risk review", "User approval", "Onchain receipt"],
  },
  {
    file: "slide-04-app.png",
    duration: 25,
    title: "Public Frontend",
    eyebrow: "Live demo",
    body: "The app is connected to Mantle Sepolia and shows the payment intent plus an AI-style risk summary.",
    notes: ["Contract configured", "Low risk: 10/100", "Intent hash", "Record safety receipt"],
  },
  {
    file: "slide-05-contract.png",
    duration: 22,
    title: "Onchain Receipt",
    eyebrow: "Mantle Sepolia",
    body: "The smart contract stores the reviewed intent and emits PaymentIntentRecorded.",
    notes: [
      "Contract: 0x4965...7335",
      "Deploy tx: 0x45f2...0dce",
      "Usage tx: 0x7264...c1fa",
      "receiptCount: 1",
    ],
  },
  {
    file: "slide-06-impact.png",
    duration: 20,
    title: "Why It Matters",
    eyebrow: "Reusable AI payment safety primitive",
    body: "Wallets, agent marketplaces, payment apps, and treasury tools can use this pattern to prove a payment intent was reviewed before execution.",
    notes: ["Open source", "Public frontend", "Deployed contract", "Successful usage tx"],
  },
  {
    file: "slide-07-close.png",
    duration: 13,
    title: "Minimum Safety Primitive",
    eyebrow: "AI intent -> risk review -> approval -> receipt",
    body: "Mantle Agent Payment Guard creates a lightweight audit trail before AI-agent payments move value.",
    notes: ["GitHub: davidweb3-ctrl/mantle-agent-payment-guard"],
  },
];

for (const slide of slides) {
  const svg = renderSvg(slide);
  const svgPath = join(slideDir, slide.file.replace(".png", ".svg"));
  const pngPath = join(slideDir, slide.file);
  writeFileSync(svgPath, svg);
  rmSync(pngPath, { force: true });
  rmSync(`${svgPath}.png`, { force: true });
  execFileSync("qlmanage", ["-t", "-s", "1920", "-o", slideDir, svgPath], { stdio: "ignore" });
  renameSync(`${svgPath}.png`, pngPath);
}

const narrationPath = join(outDir, "narration.aiff");
const script = `Mantle Agent Payment Guard is an onchain receipt system for AI agent payment safety on Mantle.

It does not move funds directly. Instead, it records proof that a user reviewed an AI generated payment intent, saw a risk summary, and authorized the intent before a payment action is executed.

The problem is simple. AI agents are getting better at triggering payments, subscriptions, swaps, and treasury actions. But after an agent acts, it can be hard to prove what the user saw, what the agent intended, and whether the user approved the risk.

This demo solves that with a pre payment safety receipt.

Here is the public app. The user connects a wallet on Mantle Sepolia. The form shows an agent address, a recipient, an amount, a token, and a payment purpose.

The AI review panel summarizes the risk. In this demo, the payment is low risk. The amount is small, the recipient address format is valid, and the purpose looks like a normal business invoice.

When the user clicks record safety receipt, the app writes the reviewed payment intent to the Mantle Sepolia smart contract.

The smart contract stores the user address, agent address, recipient, amount, token symbol, intent hash, risk score, risk summary, chain id, and timestamp. It also emits a Payment Intent Recorded event.

This transaction is the first successful usage proof for the project. It called the deployed contract on Mantle Sepolia and increased receipt count to one.

The result is a lightweight audit trail for AI agent payments. Wallets, payment apps, agent marketplaces, and treasury tools can use this pattern to prove that a payment intent was reviewed before execution.

The project is open source, has a public frontend, a deployed Mantle Sepolia contract, a successful usage transaction, and a reproducible README.

This is the minimum safety primitive. AI payment intent, risk review, user approval, and onchain receipt.`;

execFileSync("say", ["-v", "Samantha", "-r", "135", "-o", narrationPath, script], { stdio: "ignore" });

const listPath = join(outDir, "slides.txt");
writeFileSync(
  listPath,
  slides.map((slide) => `file '${join(slideDir, slide.file)}'\nduration ${slide.duration}`).join("\n") +
    `\nfile '${join(slideDir, slides.at(-1).file)}'\n`,
);

const silentVideoPath = join(outDir, "silent.mp4");
const finalPath = join(root, "demo", "mantle-agent-payment-guard-demo.mp4");

execFileSync(
  "ffmpeg",
  [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    listPath,
    "-vf",
    "scale=1920:1080,format=yuv420p",
    "-r",
    "30",
    silentVideoPath,
  ],
  { stdio: "ignore" },
);

execFileSync(
  "ffmpeg",
  [
    "-y",
    "-i",
    silentVideoPath,
    "-i",
    narrationPath,
    "-c:v",
    "libx264",
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    "-shortest",
    "-movflags",
    "+faststart",
    finalPath,
  ],
  { stdio: "ignore" },
);

console.log(finalPath);

function renderSvg(slide) {
  const noteItems = slide.notes
    .map((note, index) => `<text x="118" y="${708 + index * 58}" class="note">${escapeXml(note)}</text>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <rect width="1920" height="1080" fill="#f7f8f3"/>
  <rect x="72" y="72" width="1776" height="936" rx="22" fill="#ffffff" stroke="#dfe3d6"/>
  <rect x="72" y="72" width="1776" height="18" fill="#ff5f1f"/>
  <text x="118" y="178" class="eyebrow">${escapeXml(slide.eyebrow)}</text>
  <text x="118" y="315" class="title">${escapeXml(slide.title)}</text>
  <foreignObject x="118" y="380" width="1260" height="210">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Inter, Arial, sans-serif; font-size: 45px; line-height: 1.28; color: #424840; font-weight: 650;">
      ${escapeXml(slide.body)}
    </div>
  </foreignObject>
  <rect x="92" y="650" width="890" height="286" rx="18" fill="#f2f4ec" stroke="#dfe3d6"/>
  ${noteItems}
  <rect x="1150" y="642" width="520" height="300" rx="24" fill="#101114"/>
  <text x="1200" y="742" class="cardTitle">Payment Safety Receipt</text>
  <text x="1200" y="812" class="cardText">Risk score: 10 / 100</text>
  <text x="1200" y="870" class="cardText">Network: Mantle Sepolia</text>
  <text x="1200" y="928" class="cardText">Receipt count: 1</text>
  <style>
    .eyebrow { font: 800 30px Inter, Arial, sans-serif; fill: #ff5f1f; letter-spacing: 0; text-transform: uppercase; }
    .title { font: 900 92px Inter, Arial, sans-serif; fill: #101114; letter-spacing: 0; }
    .note { font: 780 36px Inter, Arial, sans-serif; fill: #101114; }
    .cardTitle { font: 850 38px Inter, Arial, sans-serif; fill: #ffffff; }
    .cardText { font: 680 30px Inter, Arial, sans-serif; fill: #e7eadf; }
  </style>
</svg>`;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
