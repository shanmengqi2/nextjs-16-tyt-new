import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

export const {
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});

const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL!;

async function proxyAuthRequest(request: Request) {
  const requestUrl = new URL(request.url);
  const proxyUrl = `${convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;
  const headers = new Headers(request.headers);

  headers.set("accept-encoding", "identity");
  headers.set("host", new URL(convexSiteUrl).host);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  return fetch(proxyUrl, init);
}

export const handler = {
  GET: proxyAuthRequest,
  POST: proxyAuthRequest,
};
