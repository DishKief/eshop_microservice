/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import cookieParser from "cookie-parser";
import initializeSiteConfig from "./libs/initializeSiteConfig";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req: any) => (req.user ? 1000 : 100), // limit each IP to 1000 if logged in, otherwise 100
  message: { error: "Too many requests from this IP, please try again later!" },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: true, // enable the `X-RateLimit-*` headers
  keyGenerator: (req: any) => {
    return req.user?.id ? `user:${req.user.id}` : ipKeyGenerator(req);
  }, // Use IP address as the key for rate limiting
});
app.use(limiter);

app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

// app.use(
//   "/product",
//   proxy("http://localhost:6002", {
//     parseReqBody: false, // added this line to fix the issue with file upload on product
//   }),
// );
// ✅ 1. File upload route (multipart → raw stream)
app.use(
  "/product/api/v1/upload-product-image",
  proxy("http://localhost:6002", {
    parseReqBody: false, // added this line to fix the issue with file upload on product
    proxyReqPathResolver: (req) => {
      return req.originalUrl.replace(/^\/product/, ""); // remove /product from the url
    },
  }),
);

// ✅ Everything else
app.use(
  "/product",
  proxy("http://localhost:6002", {
    proxyReqPathResolver: (req) => {
      return req.originalUrl.replace(/^\/product/, ""); // remove /product from the url
    },
  }),
);

app.use("/", proxy("http://localhost:6001"));

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  try {
    initializeSiteConfig();
    console.log("Site config initialized successfully!");
  } catch (error) {
    console.error("Failed to initialize site config:", error);
  }
});
server.on("error", console.error);
