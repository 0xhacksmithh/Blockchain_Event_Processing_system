import { fetchPendingEvents } from "./queries.js";
import { publish } from "./processor.js";

export async function runPublisher() {
  console.log(`OutBox Worker Running.....`);
  while (true) {
    try {
      const events = await fetchPendingEvents();
      for (const event of events) {
        await publish(event);
      }
    } catch (error) {
      console.error(error.message);
    }

    await new Promise((resolve) => setTimeout(resolve, 9000));
  }
}
