import { producer } from "../kafka/kafkaProducer.js";
import { markPublished, markFailed } from "./queries.js";

export async function publish(event) {
  try {
    await producer.send({
      topic: "payment-events",
      messages: [
        {
          key: event.id,
          value: JSON.stringify(event.payload),
        },
      ],
    });
    await markPublished(event.id);
    console.log("Published", event.id);
  } catch (error) {
    await markFailed(event.id, error);
    console.error(error.message);
  }
}
