import { kafka } from "./client.js";

export const producer = kafka.producer();

export const startKafkaPoducer = async () => {
  await producer.connect();
  console.log("Kafka Producer Connected....");
};
