import { kafka } from "./client.js";
import { db } from "../db/index.js";

const consumer = kafka.consumer({
  groupId: "notification-group",
});

// duplicate protection
async function alreadyConsumed(eventId) {
  const result = await db.query(
    `
    SELECT *
    FROM consumed_events
    WHERE event_id=$1
    `,
    [eventId],
  );
  return result.rowCount > 0;
}

// process message
async function handleMessage(message) {
  const payload = JSON.parse(message.value.toString());
  const eventId = message.key.toString();

  if (await alreadyConsumed(eventId)) {
    console.log(`Dupicate Event :: ${eventId}`);
    return;
  }

  // Transaction
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    console.log("Sending Email :: ", payload.paymentId);

    await client.query(
      `
      INSERT INTO consumed_events(
        event_id
      )
      VALUES($1)
      `,
      [eventId],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");

    throw error;
  } finally {
    client.release();
  }
}

// start consumer
export async function startKafkaConsumer() {
  await consumer.connect();
  await consumer.subscribe({
    topic: "payment-events",
    fromBeginning: true,
  });

  console.log(`Kafka Consumer Running.....`);
  await consumer.run({
    eachMessage: async ({ message }) => {
      await handleMessage(message);
    },
  });
}
