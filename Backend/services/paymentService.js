import { v4 as uuid } from "uuid";

export async function processPayment(tx, eventData) {
  const { paymentId, payer, amount, txHash, blockNumber, eventId } = eventData;

  // 1. Save Payment
  await tx.query(
    `
        INSERT INTO payments(
           payment_id,
           payer,
           amount,
           tx_hash,
           block_number
        )
        VALUES($1, $2, $3, $4, $5)
        `,
    [paymentId, payer, amount, txHash, blockNumber],
  );

  // 2. Save Processed Event
  await tx.query(
    `
        INSERT INTO processed_events(
           event_id,
           tx_hash,
           block_number
        )
        VALUES($1, $2, $3)
        `,
    [eventId, txHash, blockNumber],
  );

  // 3. Insert Outbox Event
  await tx.query(
    `
        INSERT INTO outbox(
           id,
           event_type,
           payload
        )
        VALUES($1, $2, $3)
        `,
    [uuid(), "PAYMENT_RECEIVED", JSON.stringify({ paymentId, payer, amount })],
  );
}
