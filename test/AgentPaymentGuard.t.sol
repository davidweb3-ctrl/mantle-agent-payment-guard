// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../contracts/AgentPaymentGuard.sol";

contract AgentPaymentGuardTest {
    AgentPaymentGuard private guard;

    address private agent = address(0xA6E17);
    address private recipient = address(0xB0B);

    function setUp() public {
        guard = new AgentPaymentGuard();
    }

    function testRecordPaymentIntent() public {
        bytes32 intentHash = keccak256("pay 15 MNT to vendor");

        uint256 id = guard.recordPaymentIntent(
            agent,
            recipient,
            15 ether,
            "MNT",
            intentHash,
            24,
            "Low risk: known vendor and small amount."
        );

        require(id == 1, "wrong receipt id");
        require(guard.receiptCount() == 1, "wrong receipt count");

        AgentPaymentGuard.Receipt memory receipt = guard.getReceipt(id);
        require(receipt.user == address(this), "wrong user");
        require(receipt.agent == agent, "wrong agent");
        require(receipt.recipient == recipient, "wrong recipient");
        require(receipt.amount == 15 ether, "wrong amount");
        require(keccak256(bytes(receipt.tokenSymbol)) == keccak256("MNT"), "wrong token");
        require(receipt.intentHash == intentHash, "wrong hash");
        require(receipt.riskScore == 24, "wrong score");
        require(
            keccak256(bytes(receipt.riskSummary)) == keccak256("Low risk: known vendor and small amount."),
            "wrong summary"
        );
        require(receipt.sourceChainId == block.chainid, "wrong chain");

        uint256[] memory ids = guard.getReceiptIdsByUser(address(this));
        require(ids.length == 1, "wrong id length");
        require(ids[0] == id, "wrong id");
    }

    function testRejectsZeroAmount() public {
        try guard.recordPaymentIntent(agent, recipient, 0, "MNT", keccak256("intent"), 10, "Low risk.") {
            revert("expected zero amount revert");
        } catch (bytes memory) {}
    }

    function testRejectsRiskScoreAbove100() public {
        try guard.recordPaymentIntent(agent, recipient, 1 ether, "MNT", keccak256("intent"), 101, "Invalid.") {
            revert("expected risk score revert");
        } catch (bytes memory) {}
    }

    function testRejectsLongSummary() public {
        string memory longSummary =
            "This risk summary is deliberately longer than the supported 280 character limit. "
            "This keeps the onchain receipt compact enough for a payment-safety audit trail while still "
            "allowing the frontend and AI review layer to preserve richer details offchain. "
            "The contract should reject this value.";

        try guard.recordPaymentIntent(agent, recipient, 1 ether, "MNT", keccak256("intent"), 60, longSummary) {
            revert("expected long summary revert");
        } catch (bytes memory) {}
    }
}
