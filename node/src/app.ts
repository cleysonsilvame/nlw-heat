import "dotenv/config";
import express, { request } from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import { router } from "./routes";

const app = express();
app.use(cors());

const serverHttp = http.createServer(app);

const io = new Server(serverHttp, {
  cors: {
    origin: "*",
  },
});

io.on("connection", socket => console.log("connected: ", socket.id));

app.use(express.json());
app.use(router);

app.get("/github", (request, response) => {
  const { GITHUB_CLIENT_ID } = process.env;
  response.redirect(
    `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`
  );
});

app.get("/signin/callback", (request, response) => {
  const { code } = request.query;

  return response.json({ code });
});

export { serverHttp, io };
