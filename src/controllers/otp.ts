import { Next } from "koa";
import { RouterContext } from "@koa/router";
import { WebSocketServer } from "ws";
import { v1 as uuidV1, v4 as uuidV4 } from "uuid";
import randomatic from "randomatic";
import cache from "../db/cache";

export const sendOTP =
	(ws: WebSocketServer) => async (ctx: RouterContext, next: Next) => {
		try {
			let { body = {} } = ctx.request;
			// todo: store temporarily

			if (body.channel !== "sms") {
				return await next();
			}

			// accumulate ws body
			let data = {};

			// generate the token based on  token_type
			if (body.token_type === "numeric") {
				data["token"] = randomatic("0", parseInt(body.token_length, 10));
			}

			if (body.token_type === "alphanumeric") {
				data["token"] = randomatic("0A", parseInt(body.token_length, 10));
			}

			data["message"] = `Hello,
  Please find your {Organization name}'s code Authentication code below.
  ${data["token"]}`;

			let reference = uuidV1();
			let business_uid = uuidV4();

			let _persist = {
				business_uid,
				transaction_uid: uuidV4(),
				token: data["token"],
				token_length: body.token_length,
				token_duration: body.expiration_time,
				token_type: body.token_type,
				phone: body.customer_mobile_number,
				created_at: new Date().toISOString(),
			};

			// set to expire after set expiration_time - default to 5
			cache.set(
				reference,
				_persist,
				parseInt(body.expiration_time || 5, 10) * 60 * 1000
			);

			// broad cast to respective devices/simulators
			if (ws.clients.size > 0) {
				ws.clients.forEach((client) => {
					// @ts-ignore
					let { phone } = client;
					if (phone && body.customer_mobile_number === phone) {
						client.send(
							JSON.stringify({
								message: data["message"],
								sender_name: "Organization name",
							})
						);
					}
				});
			}

			ctx.body = {
				status: "success",
				code: "200",
				message: "SMS Verification has been sent successfully",
				data: {
					business_uid,
					reference,
					channel: {
						id: 4,
						name: "sms",
						is_active: true,
					},
					token: null,
					status: "sent",
				},
			};
		} catch {
			ctx.status = 500;
			ctx.body = {
				code: "500",
				status: "failed",
				message: "Application error",
			};
		}
	};

export const verifyOTP = async (ctx: RouterContext) => {
	try {
		let { body = {} } = ctx.request;

		let token: { [x: string]: string } | undefined = cache.get(
			body.verification_reference
		);
		if (!token) {
			ctx.status = 404;
			ctx.body = {
				status: "failed",
				code: "06",
				message: "Record not found",
			};
			return;
		}

		if (body.verification_code !== token.token) {
			ctx.status = 404;
			ctx.body = {
				status: "failed",
				code: "06",
				message: "Record not found",
			};
			return;
		}

		// delete token.. It is a one use token !
		cache.del(body.verification_reference);

		ctx.body = {
			status: "success",
			code: "200",
			message: "confirm verification",
			data: {
				...token,
				channel_id: 4,
				id: Math.floor(Math.random() * 10000),
				status: "confirmed",
				confirmation_charge: 0,
				email: null,
				verified_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				deleted_at: null,
				channel: {
					id: 4,
					name: "sms",
				},
			},
		};
	} catch {
		ctx.status = 500;
		ctx.body = {
			code: "500",
			status: "failed",
			message: "Application error",
		};
	}
};
