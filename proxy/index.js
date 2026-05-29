// 完整的Cloudflare Workers代理脚本
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

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