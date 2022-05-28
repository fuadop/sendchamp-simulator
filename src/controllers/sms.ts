import { RouterContext } from "@koa/router";
import { WebSocketServer } from "ws";
import { v1 as uuidV1, v4 as uuidV4 } from "uuid";

const BASE_PRICE = 0.00850;
export const send = (ws: WebSocketServer) =>
  async (ctx: RouterContext) => {
    try {
      let { body = {} } = ctx.request;
      if (typeof body.to === "string") {
        body.to = [body.to];
      }
      // todo: store temporarily

      // broad cast to respective devices/simulators
      if (ws.clients.size > 0) {
        ws.clients.forEach((client) => {
          // @ts-ignore
          let { phone } = client;
          if (phone && body.to.includes(phone)) {
            client.send(JSON.stringify(body));
          }
        });
      }

      if (body.to.length > 1) {
        ctx.body = {
          status: "success",
          code: "200",
          message: "Message sent successfully",
          data: {
            message: body.message,
            business_uid: uuidV4(),
            uid: uuidV1(),
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            id: Math.floor(Math.random() * 1000)
          }
        };
        return;
      }

      ctx.body = {
        status: "success",
        code: "200",
        message: "success",
        data: {
          id: uuidV1(),
          phone_number: "+" + body.to[0],
          reference: uuidV1().split("-").reverse().join(""),
          amount: (body.to.length * BASE_PRICE).toString(),
          service_charge: "0.00000",
          sent_at: new Date().toISOString(),
          delivered_at: null
        }
      };
    } catch {
      ctx.status = 500;
      ctx.body = {
        code: "500",
        status: "failed",
        message: "Application error"
      };
    }
  };
