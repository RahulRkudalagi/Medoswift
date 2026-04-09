import http from "http";
import express from "express";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

async function main() {
  // 1. Connect directly using the Environment Variable we set in Render
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas (DBaaS)");
  } catch (err) {
    console.error("❌ DB Connection Error:", err);
  }

  // 2. Create the Express App inline (No need for app.js)
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("✅ MedoSwift API is Live on PaaS!");
  });

  const server = http.createServer(app);

  // 3. Dynamic Port for Render
  const PORT = process.env.PORT || 10000;

  // 4. Socket.io Configuration
  const io = new Server(server, {
    cors: {
      origin: "*", // Allows your frontend to connect easily
      credentials: true
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.on("disconnect", () => console.log("Disconnected"));
  });

  // 5. Start Server
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 MedoSwift running on port ${PORT}`);
  });
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
