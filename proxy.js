export default {
  async fetch(request) {
    const requestUrl = new URL(request.url);
    const target = requestUrl.searchParams.get("url");

    if (!target) {
      return new Response("Missing ?url=", {
        status: 400
      });
    }

    let targetUrl;

    try {
      targetUrl = new URL(target);
    } catch {
      return new Response("Invalid URL", {
        status: 400
      });
    }

    // TEST SAFETY:
    // Don't turn this into an unrestricted public proxy.
    // Replace this with domains you control/are authorized to access.
    const allowedHosts = [
      "example.com"
    ];

    if (!allowedHosts.includes(targetUrl.hostname)) {
      return new Response("Target host is not allowed in this test.", {
        status: 403
      });
    }

    try {
      const upstream = await fetch(targetUrl.toString(), {
        method: "GET",
        headers: {
          "User-Agent": "Stream-Test-Worker"
        }
      });

      const headers = new Headers();

      headers.set(
        "Content-Type",
        upstream.headers.get("Content-Type") || "text/plain"
      );

      headers.set("Access-Control-Allow-Origin", "*");

      return new Response(upstream.body, {
        status: upstream.status,
        headers
      });

    } catch (error) {
      return new Response(
        "Upstream request failed: " + error.message,
        { status: 502 }
      );
    }
  }
};
