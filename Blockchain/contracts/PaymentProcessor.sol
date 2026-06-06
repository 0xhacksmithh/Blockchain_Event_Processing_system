// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract PaymentProcessor {

    uint256 public paymentCounter;

    event PaymentReceived(
        uint256 indexed paymentId,
        address indexed payer,
        uint256 amount,
        uint256 timestamp
    );

    function pay() external payable {

        require(msg.value > 0, "Amount required");

        paymentCounter++;

        emit PaymentReceived(
            paymentCounter,
            msg.sender,
            msg.value,
            block.timestamp
        );
    }
}