export async function register() {
  if (process.env.NODE_ENV === "production") {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      await import("../sentry.server.config");
    }

    if (process.env.NEXT_RUNTIME === "edge") {
      await import("../sentry.edge.config");
    }
  }
}

export function onRequestError(err: any, request: any, context: any) {
  if (process.env.NODE_ENV === "production") {
    import("@sentry/nextjs").then((Sentry) => {
      Sentry.captureRequestError(err, request, context);
    });
  }
}
