# Demo Video Script

Project: Mantle Agent Payment Guard

Target length: 2+ minutes.

## Voiceover

Mantle Agent Payment Guard is an onchain receipt system for AI-agent payment safety on Mantle.

It does not move funds directly. Instead, it records proof that a user reviewed an AI-generated payment intent, saw a risk summary, and authorized the intent before a payment action is executed.

The problem is simple: AI agents are getting better at triggering payments, subscriptions, swaps, and treasury actions. But after an agent acts, it can be hard to prove what the user saw, what the agent intended, and whether the user approved the risk.

This demo solves that with a pre-payment safety receipt.

Here is the public app. The user connects a wallet on Mantle Sepolia. The form shows an agent address, a recipient, an amount, a token, and a payment purpose.

The AI review panel summarizes the risk. In this demo, the payment is low risk: the amount is small, the recipient address format is valid, and the purpose looks like a normal business invoice.

When the user clicks record safety receipt, the app writes the reviewed payment intent to the Mantle Sepolia smart contract.

The smart contract stores the user address, agent address, recipient, amount, token symbol, intent hash, risk score, risk summary, chain id, and timestamp. It also emits a PaymentIntentRecorded event.

This transaction is the first successful usage proof for the project. It called the deployed contract on Mantle Sepolia and increased receiptCount to one.

The result is a lightweight audit trail for AI-agent payments. Wallets, payment apps, agent marketplaces, and treasury tools can use this pattern to prove that a payment intent was reviewed before execution.

The project is open source, has a public frontend, a deployed Mantle Sepolia contract, a successful usage transaction, and a reproducible README.

This is the minimum safety primitive: AI payment intent, risk review, user approval, and onchain receipt.
