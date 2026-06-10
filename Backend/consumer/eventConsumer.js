import dotenv from "dotenv";
import { ethers } from "ethers";

import { db } from "../db/index.js";
import { provider } from "../config/provider.js";
import { abi } from "./abi.js";
import { processPayment } from "../services/paymentService.js";

dotenv.config();

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  provider,
);

// Read CheckPoints
async function getCheckpoints() {
  const result = await db.query(
    `
        SELECT last_processed_block
        FROM checkpoints
        WHERE contract_address=$1
        `,
    [process.env.CONTRACT_ADDRESS],
  );

  return Number(result.rows[0].last_processed_block);
}

// Update Checkpoints
async function updateCheckpoint(tx, blockNumber) {
  await tx.query(
    `
        UPDATE checkpoints
        SET last_processed_block=$1
        WHERE contract_address=$2
        `,
    [blockNumber, process.env.CONTRACT_ADDRESS],
  );
}

// Duplicate Protection
async function eventAlreadyProcessed(eventId) {
  const result = await db.query(
    `
        SELECT event_id
        FROM processed_events
        WHERE event_id=$1
        `,
    [eventId],
  );

  return result.rowCount > 0;
}

// Event handlet
async function handleLog(log) {
  const parsed = contract.interface.parseLog(log);
  const paymentId = Number(parsed.args.paymentId);
  const payer = parsed.args.payer;
  const amount = parsed.args.amount.toString();
  const eventId = `${log.transactionHash}-${log.index}`;
  const alreadyProcessed = await eventAlreadyProcessed(eventId);

  if (alreadyProcessed) {
    console.log("Skipping duplicate event: ", eventId);

    return;
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");
    await processPayment(client, {
      paymentId,
      payer,
      amount,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      eventId,
    });

    await updateCheckpoint(client, log.blockNumber);
    await client.query("COMMIT");
    console.log("Processed Event : ", paymentId);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);

    throw error;
  } finally {
    client.release();
  }
}

// Recover Logic
async function recoverMissedEvents() {
  const checkpoint = await getCheckpoints();
  const latestBlock = await provider.getBlockNumber();

  console.log(`CheckPoint : ${checkpoint}`);
  console.log(`Latest : ${latestBlock}`);

  const logs = await provider.getLogs({
    address: process.env.CONTRACT_ADDRESS,
    fromBlock: checkpoint + 1,
    toBlock: latestBlock,
  });

  console.log(`Found ${logs.length} logs`);

  for (const log of logs) {
    await handleLog(log);
  }
}

// Consumer Loop
export async function startConsumer() {
  console.log("Starting Blockchain Consumer.....");

  while (true) {
    try {
      await recoverMissedEvents();
    } catch (error) {
      console.error("Consumer Error :", error);
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}
