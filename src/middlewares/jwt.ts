import { RouterContext } from "@koa/router";
import { Next } from "koa";

export const isAuthenticated = async (ctx: RouterContext, next: Next)=> {
  if (!ctx.headers["authorization"]) {
    ctx.status = 401;
    ctx.body = {
      status: "failed",
      code: "06",
      message: "Unauthenticated"
    };
    return;
  }
  await next();
};