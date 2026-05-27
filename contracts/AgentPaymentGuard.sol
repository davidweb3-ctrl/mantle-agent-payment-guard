// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AgentPaymentGuard
/// @notice Records AI-reviewed payment intents before an agent or user executes an onchain payment.
contract AgentPaymentGuard {
    struct Receipt {
        address user;
        address agent;
        address recipient;
        uint256 amount;
        string tokenSymbol;
        bytes32 intentHash;
        uint8 riskScore;
        string riskSummary;
        uint256 sourceChainId;
        uint256 createdAt;
    }

    uint256 public receiptCount;

    mapping(uint256 id => Receipt) private receipts;
    mapping(address user => uint256[]) private receiptIdsByUser;

    event PaymentIntentRecorded(
        uint256 indexed id,
        address indexed user,
        address indexed agent,
        address recipient,
        uint256 amount,
        string tokenSymbol,
        bytes32 intentHash,
        uint8 riskScore,
        string riskSummary
    );

    error InvalidRecipient();
    error InvalidAmount();
    error InvalidIntentHash();
    error RiskScoreTooHigh();
    error TokenSymbolTooLong();
    error RiskSummaryTooLong();

    function recordPaymentIntent(
        address agent,
        address recipient,
        uint256 amount,
        string calldata tokenSymbol,
        bytes32 intentHash,
        uint8 riskScore,
        string calldata riskSummary
    ) external returns (uint256 id) {
        if (recipient == address(0)) revert InvalidRecipient();
        if (amount == 0) revert InvalidAmount();
        if (intentHash == bytes32(0)) revert InvalidIntentHash();
        if (riskScore > 100) revert RiskScoreTooHigh();
        if (bytes(tokenSymbol).length > 32) revert TokenSymbolTooLong();
        if (bytes(riskSummary).length > 280) revert RiskSummaryTooLong();

        id = ++receiptCount;

        receipts[id] = Receipt({
            user: msg.sender,
            agent: agent,
            recipient: recipient,
            amount: amount,
            tokenSymbol: tokenSymbol,
            intentHash: intentHash,
            riskScore: riskScore,
            riskSummary: riskSummary,
            sourceChainId: block.chainid,
            createdAt: block.timestamp
        });

        receiptIdsByUser[msg.sender].push(id);

        emit PaymentIntentRecorded(
            id,
            msg.sender,
            agent,
            recipient,
            amount,
            tokenSymbol,
            intentHash,
            riskScore,
            riskSummary
        );
    }

    function getReceipt(uint256 id) external view returns (Receipt memory) {
        return receipts[id];
    }

    function getReceiptIdsByUser(address user) external view returns (uint256[] memory) {
        return receiptIdsByUser[user];
    }
}

