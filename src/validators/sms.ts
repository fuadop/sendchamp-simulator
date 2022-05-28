import { RouterContext } from "@koa/router";
import { Next } from "koa";

let requiredKeys = ["to", "message", "sender_name", "route"];

let supportedRoutes = ["dnd", "non_dnd", "international"];

export const validateSend = async (ctx: RouterContext, next: Next) => {
	let { body = {} } = ctx.request;
	for (const key of requiredKeys) {
		if (!body[key]) {
			let data = {};
			requiredKeys
				.filter((k) => !body[k])
				.forEach((k) => {
					data[k] = [`The ${k.split("_").join(" ")} field is required.`];
				});
			ctx.status = 400;
			ctx.body = {
				status: "failed",
				code: "06",
				message: `The ${key} field is required.`,
				validationErrors: "Validation failed.",
				data,
			};
			return;
		}
	}

	if (body.route && !supportedRoutes.includes(body.route)) {
		ctx.status = 400;
		ctx.body = {
			status: "failed",
			code: "06",
			message: "The selected route is invalid.",
			validationErrors: "Validation failed.",
			data: {
				route: ["The selected route is invalid."],
			},
		};
		return;
	}

	if (body.to) {
		if (typeof body.to === "string") {
			if ((body.to as string).length != 13) {
				ctx.status = 400;
				ctx.body = {
					status: "failed",
					code: "500",
					message: "Application error",
				};
				return;
			}
		}

		if (Array.isArray(body.to)) {
			for (const num of Array.from(body.to)) {
				if ((num as string).length != 13) {
					ctx.status = 400;
					ctx.body = {
						status: "failed",
						code: "400",
						message: "Invalid phone number",
					};
					return;
				}
			}
		}
	}
	await next();
};
