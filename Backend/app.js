import express from "express";
import dotenv from "dotenv";
import { startConsumer } from "./consumer/eventConsumer.js";
import { startKafkaPoducer } from "./kafka/kafkaProducer.js";
import { startKafkaConsumer } from "./kafka/kafkaNotificationConsumer.js";
import { runPublisher } from "./outbox/publisher.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server Running On PORT :: ${PORT}`);
});

// running consumer to consume blockchain logs
startConsumer();

// running kafka producer
startKafkaPoducer();

// running kafka consumer
startKafkaConsumer();

// running Outbox Worker
runPublisher();
