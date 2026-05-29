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

async function handleRequest(request) {
	const url = new URL(request.url)
	const targetUrl = url.searchParams.get("target")

	if (!targetUrl) {
		return new Response("❌ 请提供目标URL参数: ?target=xxx", { status: 400 })
	}

	try {
		const response = await fetch(targetUrl, {
			method: request.method,
			headers: request.headers,
			body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
			redirect: "follow"
		})

		const modifiedHeaders = new Headers(response.headers)
		modifiedHeaders.set("Access-Control-Allow-Origin", "*")
		modifiedHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		modifiedHeaders.set("Access-Control-Allow-Headers", "*")

		return new Response(response.body, {
			status: response.status,
			headers: modifiedHeaders
		})
	} catch (error) {
		return new Response("❌ 请求失败: " + error.message, { status: 500 })
	}
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		return new Response(handleRequest(request));
	},
} satisfies ExportedHandler<Env>;
