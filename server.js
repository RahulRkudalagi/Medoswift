import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";

async function main() {
  // 1. Connect to DBaaS (MongoDB Atlas)
  await connectDb();

  const app = createApp();
  const server = http.createServer(app);

  // 2. Dynamic Port for PaaS (Crucial for Deployment)
  // PaaS providers like Render/Railway inject a PORT variable
  const PORT = process.env.PORT || env.port || 5000;

  // 3. Socket.io Configuration
  // Note: env.clientUrl should be your Render Frontend URL after deployment
  const io = new Server(server, {
    cors: {
      origin: [env.clientUrl, "http://localhost:5173"], // Allows both local and cloud frontend
      credentials: true
    },
  });

  // Expose to routes for emitting
  app.set("io", io);

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on("join", ({ rooms }) => {
      if (!Array.isArray(rooms)) return;
      for (const r of rooms) socket.join(String(r));
    });

    socket.on("leave", ({ rooms }) => {
      if (!Array.isArray(rooms)) return;
      for (const r of rooms) socket.leave(String(r));
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  // 4. Start Server
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`✅ MedoSwift API running on port ${PORT}`);
  });
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error("Fatal error:", e);
  process.exit(1);
});
