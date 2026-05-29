/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// 定义环境变量类型（可根据实际需求扩展）
interface Env {}

/**
 * 代理请求到目标 URL，并添加 CORS 响应头
 * @param request 原始请求对象
 * @returns 代理响应或错误响应
 */
async function handleRequest(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const targetUrl = url.searchParams.get("target");

	if (!targetUrl) {
		return new Response("❌ 请提供目标URL参数: ?target=xxx", { status: 400 });
	}

	try {
		// 转发请求到目标地址
		const response = await fetch(targetUrl, {
			method: request.method,
			headers: request.headers,
			// GET 和 HEAD 请求不能包含 body
			body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
			redirect: "follow",
		});

		// 修改响应头，添加 CORS 支持
		const modifiedHeaders = new Headers(response.headers);
		modifiedHeaders.set("Access-Control-Allow-Origin", "*");
		modifiedHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
		modifiedHeaders.set("Access-Control-Allow-Headers", "*");

		return new Response(response.body, {
			status: response.status,
			headers: modifiedHeaders,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return new Response("❌ 请求失败: " + message, { status: 500 });
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// 直接返回 handleRequest 的 Promise 结果，而不是用 new Response() 包裹
		return handleRequest(request);
	},
} satisfies ExportedHandler<Env>;