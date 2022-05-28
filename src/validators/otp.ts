import { Next } from "koa";
import { RouterContext } from "@koa/router";

let requiredKeys = [
  "channel",
  "customer_mobile_number",
  "token_type",
  "token_length",
  "expiration_time",
  "meta_data",
];

let supportedChannels = [
  "sms",
  "email"
];

let supportedTokenTypes = [
  "numeric",
  "alphanumeric"
];

let verifyRequiredKeys = [
  "verification_code",
  "verification_reference"
];

export const validateSendOTP = async (ctx: RouterContext, next: Next) => {
  let { body = {} } = ctx.request;
  for (const key of requiredKeys) {
    if (!body[key]) {
      let data = {};
      requiredKeys.filter(k => !body[k]).forEach((k) => {
        data[k] = [`The ${k.split("_").join(" ")} field is required.`];
      });
      ctx.status = 400;
      ctx.body = {
        status: "failed",
        code: "06",
        message: `The ${key} field is required.`,
        validationErrors: "Validation failed.",
        data
      };
      return;
    }
  }

  if (body.channel && !supportedChannels.includes(body.channel)) {
    ctx.status = 400;
    ctx.body = {
      status: "failed",
      code: "06",
      message: "The selected channel is invalid.",
      validationErrors: "Validation failed.",
      data: {
        channel: ["The selected channel is invalid."]
      }
    };
    return;
  }

  if (body.token_type && !supportedTokenTypes.includes(body.token_type)) {
    ctx.status = 400;
    ctx.body = {
      status: "failed",
      code: "06",
      message: "The selected token type is invalid.",
      validationErrors: "Validation failed.",
      data: {
        token_type: ["The selected token type is invalid."]
      }
    };
    return;
  }

  if (body.customer_mobile_number) {
    if ((body.customer_mobile_number as string).length != 13) {
      ctx.status = 400;
      ctx.body = {
        status: "failed",
        code: "400",
        message:"Invalid phone number"
      };
      return;
    }
  }
  await next();
};

export const validateVerifyOTP = async (ctx: RouterContext, next: Next) => {
  let { body = {} } = ctx.request;
  for (const key of verifyRequiredKeys) {
    if (!body[key]) {
      let data = {};
      verifyRequiredKeys.filter(k => !body[k]).forEach((k) => {
        data[k] = [`The ${k.split("_").join(" ")} field is required.`];
      });
      ctx.status = 400;
      ctx.body = {
        status: "failed",
        code: "06",
        message: `The ${key} field is required.`,
        validationErrors: "Validation failed.",
        data
      };
      return;
    }
  }

  await next();
};
