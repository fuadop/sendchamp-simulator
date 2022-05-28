import http from "node:http";
import path from "node:path";
import Koa from "koa";
import logger from "koa-logger";
import bodyParser from "koa-bodyparser";
import json from "koa-json";
import serve from "koa-static";
// import proxy from "koa-proxy";
import proxy from "@fuadop/koa-proxy";
import cors from "@koa/cors";
import Router from "@koa/router";
import { WebSocketServer } from "ws";
import { log } from "./utils/logger";
import { send } from "./controllers/sms";
import { sendOTP, verifyOTP } from "./controllers/otp";
import { validateSend } from "./validators/sms";
import { validateSendOTP, validateVerifyOTP } from "./validators/otp";
import { isAuthenticated } from "./middlewares/jwt";

export default class Simulator {
  private port: number = 2981;
  private app = new Koa();
  private router = new Router();
  private phone: number;
  // create server
  private server: http.Server = http.createServer(this.app.callback()) ;
  private ws: WebSocketServer = new WebSocketServer({
    server: this.server,
    path: "/ws"
  });

  constructor (phone: number, port: number = 2981) {
    this.port = port || this.port;
    this.phone = phone;
  }

  public start() {
    // setup router middleware
    this.router.use("/api/v1/sms/send", validateSend);
    this.router.use("/api/v1/verification/create", validateSendOTP);
    this.router.use("/api/v1/verification/confirm", validateVerifyOTP);

    // setup routes
    this.router.post("/api/v1/sms/send", send(this.ws));
    this.router.post("/api/v1/verification/create", sendOTP(this.ws));
    this.router.post("/api/v1/verification/confirm", verifyOTP);

    // set up websocket listeners
    this.ws.on("connection", (ws) => {
      log("Device connected to socket");
      ws.on("message", (data: Buffer) => {
        let parsed = Buffer.from(data).toString("binary");
        let metaData: {phone?: string} = {}
        try {
          metaData = JSON.parse(parsed);
        } catch {}

        if (metaData && metaData.phone) {
          // @ts-ignore
          ws.phone = metaData.phone
        }
      });
    });

    this.ws.on("close", () => {
      log("Device disconnected from socket");
    });

    // setup middlewares
    this.app.use(cors({
      origin: "*"
    }));
    this.app.use(serve(path.resolve(__dirname, "..", "public")));
    this.app.use(logger());
    this.app.use(bodyParser());
    this.app.use(json());
    this.app.use(this.router.routes())
    this.app.use(this.router.allowedMethods())
    this.app.use(isAuthenticated);
    // proxies
    this.app.use(proxy({
      host: "https://api.sendchamp.com"
    }));

    // start server
    this.server.listen(this.port, () => {
      log(`Simulator started on http://localhost:${this.port}/?phone=${this.phone}`);
    });
  }

  public stop() {
    this.ws.close();
    this.server.close();
  }
}