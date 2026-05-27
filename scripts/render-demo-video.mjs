import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const outDir = join(root, "demo", "rendered");
const slideDir = join(outDir, "slides");
const captureDir = join(root, "demo", "captures-v2");
const audioPath = join(root, "demo", "elevenlabs-narration.mp3");
const finalPath = join(root, "demo", "mantle-agent-payment-guard-demo.mp4");
const previewPath = join(outDir, "preview-v2-70s.png");

if (!existsSync(audioPath)) {
  throw new Error(`Missing narration file: ${audioPath}`);
}

mkdirSync(slideDir, { recursive: true });

const facts = {
  contract: "0x4965e045fBA701c8d98B445155e82B2E153e7335",
  deployTx: "0x45f245e4d916d0f4cf0f97438e21267d399059069a27f4cfe2a3dae405160dce",
  usageTx: "0x7264d23c8e5c0a3e57559e9af64b81bfba42dd13f5c65ae3e13299101633c1fa",
  wallet: "0x593Eccd993d53f141194C8f85C9601560b8699D1",
  frontend: "https://davidweb3-ctrl.github.io/mantle-agent-payment-guard/",
  repo: "https://github.com/davidweb3-ctrl/mantle-agent-payment-guard",
  explorerTx: "https://sepolia.mantlescan.xyz/tx/0x7264d23c8e5c0a3e57559e9af64b81bfba42dd13f5c65ae3e13299101633c1fa",
};

const slides = [
  titleSlide(),
  problemSlide(),
  screenshotSlide({
    file: "slide-03-github.png",
    duration: 19,
    eyebrow: "Open source proof",
    title: "Repository and build proof",
    screenshot: join(captureDir, "github.png"),
    link: "github.com/davidweb3-ctrl/mantle-agent-payment-guard",
    bullets: [
      "Public GitHub repo with Solidity contract and React frontend.",
      "README includes architecture, deployed contract, and usage proof.",
      "Built for The Turing Test Hackathon 2026 AI DevTools track.",
    ],
  }),
  screenshotSlide({
    file: "slide-04-frontend.png",
    duration: 27,
    eyebrow: "Live public frontend",
    title: "Payment intent review UI",
    screenshot: join(captureDir, "frontend.png"),
    link: "davidweb3-ctrl.github.io/mantle-agent-payment-guard",
    bullets: [
      "The app shows agent, recipient, amount, token, and purpose.",
      "An AI-style review produces a risk score and risk summary.",
      "Users record a compact safety receipt on Mantle Sepolia.",
    ],
  }),
  receiptSlide(),
  onchainSlide(),
  useCaseSlide(),
  closingSlide(),
];

for (const slide of slides) {
  const svgPath = join(slideDir, slide.file.replace(".png", ".svg"));
  const pngPath = join(slideDir, slide.file);
  writeFileSync(svgPath, slide.svg);
  rmSync(pngPath, { force: true });
  rmSync(`${svgPath}.png`, { force: true });
  execFileSync(
    "npx",
    [
      "playwright",
      "screenshot",
      "--viewport-size=1920,1080",
      "--wait-for-timeout=100",
      `file://${svgPath}`,
      pngPath,
    ],
    { stdio: "ignore" },
  );
}

const listPath = join(outDir, "slides-v2.txt");
writeFileSync(
  listPath,
  slides.map((slide) => `file '${join(slideDir, slide.file)}'\nduration ${slide.duration}`).join("\n") +
    `\nfile '${join(slideDir, slides.at(-1).file)}'\n`,
);

const silentVideoPath = join(outDir, "silent-v2.mp4");
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
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    silentVideoPath,
  ],
  { stdio: "inherit" },
);

execFileSync(
  "ffmpeg",
  [
    "-y",
    "-i",
    silentVideoPath,
    "-i",
    audioPath,
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "20",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-shortest",
    "-movflags",
    "+faststart",
    finalPath,
  ],
  { stdio: "inherit" },
);

execFileSync(
  "ffmpeg",
  ["-y", "-ss", "70", "-i", finalPath, "-frames:v", "1", previewPath],
  { stdio: "ignore" },
);

console.log(finalPath);
console.log(previewPath);

function titleSlide() {
  const logo = imageData(join(root, "public", "logo.png"));
  return {
    file: "slide-01-title.png",
    duration: 11,
    svg: page({
      eyebrow: "AI DevTools on Mantle",
      title: "Mantle Agent Payment Guard",
      body: "A pre-payment safety receipt for AI-agent actions. Review intent, surface risk, then record user approval on Mantle.",
      content: `
        <image href="${logo}" x="1412" y="168" width="180" height="180" rx="32"/>
        ${pill(120, 725, "Public frontend")}
        ${pill(420, 725, "Mantle Sepolia contract")}
        ${pill(800, 725, "Successful usage tx")}
        ${miniCode(120, 838, facts.contract)}
      `,
    }),
  };
}

function problemSlide() {
  return {
    file: "slide-02-problem.png",
    duration: 17,
    svg: page({
      eyebrow: "Problem",
      title: "AI agents can initiate payments, but teams need evidence",
      body: "After an agent acts, a user or reviewer may need to prove what was requested, what risk was shown, and whether it was approved.",
      content: `
        ${flowBox(120, 680, "Agent intent", "Recipient, amount, token, purpose")}
        ${flowBox(540, 680, "Risk review", "AI-style summary and score")}
        ${flowBox(960, 680, "User approval", "Explicit click before receipt")}
        ${flowBox(1380, 680, "Onchain receipt", "Audit trail on Mantle")}
      `,
    }),
  };
}

function receiptSlide() {
  return {
    file: "slide-05-receipt.png",
    duration: 22,
    svg: page({
      eyebrow: "What the transaction records",
      title: "This is not a payment. It is an approval receipt.",
      body: "The contract stores a reviewed payment intent so wallets, agent platforms, and teams can prove the risk prompt existed before value moved.",
      content: `
        ${evidenceCard(120, 648, "Stored fields", [
          "user, agent, recipient",
          "amount and token symbol",
          "intent hash",
          "risk score and risk summary",
          "source chain id and timestamp",
        ])}
        ${evidenceCard(1020, 648, "Demo values", [
          "agent: 0x0000...a617",
          "recipient: 0x1111...1111",
          "amount: 12.5 MNT",
          "risk score: 10 / 100",
          "receiptCount: 1",
        ])}
      `,
    }),
  };
}

function onchainSlide() {
  return {
    file: "slide-06-onchain.png",
    duration: 23,
    svg: page({
      eyebrow: "Onchain evidence",
      title: "Mantle Sepolia deployment and first usage are complete",
      body: "The submission includes exact contract facts, explorer links, and a successful usage transaction for verification.",
      content: `
        ${factLine(120, 660, "Contract", facts.contract)}
        ${factLine(120, 742, "Deploy tx", facts.deployTx)}
        ${factLine(120, 824, "Usage tx", facts.usageTx)}
        ${factLine(120, 906, "Result", "usage transaction succeeded and receiptCount() returns 1")}
      `,
    }),
  };
}

function useCaseSlide() {
  return {
    file: "slide-07-usecases.png",
    duration: 14,
    svg: page({
      eyebrow: "Why it matters",
      title: "A small safety primitive for agent payments",
      body: "The same pattern can be reused wherever an automated actor prepares a payment and a human needs a durable approval trail.",
      content: `
        ${flowBox(120, 690, "Wallets", "Show risk before signing")}
        ${flowBox(540, 690, "Agent marketplaces", "Attach receipts to actions")}
        ${flowBox(960, 690, "Payment apps", "Keep approval evidence")}
        ${flowBox(1380, 690, "Treasury tools", "Review recurring spend")}
      `,
    }),
  };
}

function closingSlide() {
  return {
    file: "slide-08-close.png",
    duration: 10,
    svg: page({
      eyebrow: "Submission package",
      title: "Open source, deployed, and used on Mantle Sepolia",
      body: "The BUIDL includes a public frontend, GitHub repo, deployed contract, usage transaction, and this demo video.",
      content: `
        ${miniCode(120, 704, facts.repo)}
        ${miniCode(120, 790, facts.frontend)}
        ${miniCode(120, 876, "https://sepolia.mantlescan.xyz/tx/0x7264...c1fa")}
      `,
    }),
  };
}

function screenshotSlide({ file, duration, eyebrow, title, screenshot, link, bullets }) {
  const shot = existsSync(screenshot) ? imageData(screenshot) : "";
  const bulletText = bullets
    .map((item, index) => textBlock(item, 1120, 514 + index * 106, 640, 30, 1.28, "#252821", 780))
    .join("");

  return {
    file,
    duration,
    svg: page({
      eyebrow,
      title,
      body: "",
      content: `
        <rect x="92" y="304" width="960" height="636" rx="20" fill="#f2f4ec" stroke="#dfe3d6"/>
        <image href="${shot}" x="116" y="328" width="912" height="513" preserveAspectRatio="xMidYMid meet"/>
        ${smallCode(116, 874, 912, link)}
        <rect x="1084" y="304" width="706" height="636" rx="20" fill="#ffffff" stroke="#dfe3d6"/>
        ${bulletText}
      `,
    }),
  };
}

function page({ eyebrow, title, body, content }) {
  const bodyBlock = body ? textBlock(body, 120, 402, 1220, 40, 1.3, "#424840", 650) : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <rect width="1920" height="1080" fill="#f7f8f3"/>
  <rect x="54" y="54" width="1812" height="972" rx="24" fill="#ffffff" stroke="#dfe3d6"/>
  <rect x="54" y="54" width="1812" height="18" fill="#ff5f1f"/>
  ${text(120, 164, eyebrow.toUpperCase(), 30, "#ff5f1f", 850)}
  ${textBlock(title, 120, 252, 1500, 72, 1.08, "#101114", 900)}
  ${bodyBlock}
  ${content}
  ${styles()}
</svg>`;
}

function evidenceCard(x, y, title, rows) {
  const lines = rows.map((row, index) => text(x + 42, y + 118 + index * 50, row, 31, "#252821", 700)).join("");
  return `
    <rect x="${x}" y="${y}" width="780" height="304" rx="20" fill="#f2f4ec" stroke="#dfe3d6"/>
    ${text(x + 42, y + 62, title, 37, "#101114", 850)}
    ${lines}
  `;
}

function flowBox(x, y, title, body) {
  return `
    <rect x="${x}" y="${y}" width="340" height="216" rx="22" fill="#101114"/>
    ${textBlock(title, x + 28, y + 66, 284, 31, 1.15, "#ffffff", 850)}
    ${textBlock(body, x + 28, y + 132, 284, 27, 1.25, "#e7eadf", 650)}
  `;
}

function factLine(x, y, label, value) {
  return `
    <rect x="${x}" y="${y - 44}" width="1680" height="64" rx="12" fill="#f2f4ec" stroke="#dfe3d6"/>
    ${text(x + 24, y, label, 28, "#ff5f1f", 850)}
    ${text(x + 210, y, value, 26, "#101114", 700, "monospace")}
  `;
}

function miniCode(x, y, value) {
  return `
    <rect x="${x}" y="${y - 44}" width="1240" height="66" rx="14" fill="#f2f4ec" stroke="#dfe3d6"/>
    ${text(x + 24, y, value, 27, "#101114", 700, "monospace")}
  `;
}

function smallCode(x, y, width, value) {
  return `
    <rect x="${x}" y="${y - 38}" width="${width}" height="56" rx="14" fill="#f2f4ec" stroke="#dfe3d6"/>
    ${text(x + 22, y, value, 22, "#101114", 700, "monospace")}
  `;
}

function pill(x, y, value) {
  return `
    <rect x="${x}" y="${y - 43}" width="${value.length * 18 + 62}" height="64" rx="32" fill="#f2f4ec" stroke="#009b70"/>
    ${text(x + 31, y, value, 28, "#007a59", 750)}
  `;
}

function text(x, y, value, size, color, weight, family = "Inter, Arial, sans-serif") {
  return `<text x="${x}" y="${y}" style="font: ${weight} ${size}px ${family}; fill: ${color}; letter-spacing: 0;">${escapeXml(value)}</text>`;
}

function textBlock(value, x, y, width, size, lineHeight, color, weight) {
  const approxChars = Math.max(18, Math.floor(width / (size * 0.55)));
  const words = value.split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > approxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);

  const tspans = lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : size * lineHeight}">${escapeXml(line)}</tspan>`)
    .join("");

  return `<text y="${y}" style="font: ${weight} ${size}px Inter, Arial, sans-serif; fill: ${color}; letter-spacing: 0;">${tspans}</text>`;
}

function imageData(path) {
  return `data:image/png;base64,${readFileSync(path).toString("base64")}`;
}

function styles() {
  return `<style>
    text { dominant-baseline: alphabetic; }
  </style>`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
