import { Kafka } from "kafkajs";
import dns from "dns";

// Force IPv4 first to avoid Node.js IPv6 connection issues
dns.setDefaultResultOrder("ipv4first");

export const kafka = new Kafka({
  clientId: "kafka-service",
  brokers: [
    "b8-pkc-619z3.us-east1.gcp.confluent.cloud:9092",
    "b28-pkc-619z3.us-east1.gcp.confluent.cloud:9092",
    "b29-pkc-619z3.us-east1.gcp.confluent.cloud:9092",
  ],
  ssl: true,
  sasl: {
    mechanism: "plain",
    username: process.env.KAFKA_API_KEY!,
    password: process.env.KAFKA_API_SECRET!,
  },
  connectionTimeout: 15000, // 15 seconds
  requestTimeout: 30000, // 30 seconds
});
