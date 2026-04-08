"use server";
import { kafka } from "packages/utils/kafka";

const producer = kafka.producer();

export async function sendKafkaEvent(eventData: {
  userId: string;
  productId?: string;
  shopId?: string;
  action: string;
  device?: string;
  country?: string;
  city?: string;
  browser?: string;
}) {
  try {
    await producer.connect();
    await producer.send({
      topic: "users-events",
      messages: [{ value: JSON.stringify(eventData) }],
    });
  } catch (error) {
    console.error("Failed to track user action", error);
  } finally {
    // Avoid disconnecting the producer here, as Next.js server actions can reuse it
    // await producer.disconnect();
  }
}
