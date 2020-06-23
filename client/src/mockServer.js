import { rest } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
	rest.post("/api/users/register", (req, res, ctx) => {
		return res(ctx.status(200), ctx.json({ msg: "Register successful" }));
	}),
	rest.post("/api/auth", (req, res, ctx) => {
		return res(ctx.status(200), ctx.json({ msg: "Auto-login successful" }));
	}),

	rest.get("*", (req, res, ctx) => {
		console.error(`Please add request handler for GET in ${req.url.toString()}`);
		return res(ctx.status(500), ctx.json({ msg: "Request handler not found for GET" }));
	}),
	rest.post("*", (req, res, ctx) => {
		console.error(`Please add request handler for POST in ${req.url.toString()}`);
		return res(ctx.status(500), ctx.json({ msg: "Request handler not found for POST" }));
	}),
	rest.put("*", (req, res, ctx) => {
		console.error(`Please add request handler for PUT in ${req.url.toString()}`);
		return res(ctx.status(500), ctx.json({ msg: "Request handler not found for PUT" }));
	}),
);

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

export { server, rest };
