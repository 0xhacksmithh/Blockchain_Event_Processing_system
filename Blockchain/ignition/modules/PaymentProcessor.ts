import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PaymentProcessorModule", (m) => {
  const paymentProcessor = m.contract("PaymentProcessor");

  return { paymentProcessor };
});
