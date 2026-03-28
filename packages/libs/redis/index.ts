import Redis from "ioredis";

// It's best practice to use environment variables for credentials
const connectionString = process.env.REDIS_URL!;

if (!connectionString) {
    throw new Error("REDIS_URL environment variable is not set.");
}

const redis = new Redis(connectionString);

redis.on("error", (err) => {
    console.error("Redis connection error:", err);
});

export default redis;