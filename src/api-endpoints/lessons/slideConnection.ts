export interface SlideFailureContext {
  elapsedSeconds: number;
  uploadComplete: boolean;
  offline: boolean;
}

export interface SlideGenerationFailure extends SlideFailureContext {
  title: string;
  message: string;
  code?: string;
  status?: number;
  canCheckConnection: boolean;
}

export interface SlideConnectionResult {
  reachable: boolean;
  message: string;
}

export const describeSlideGenerationFailure = (
  error: unknown,
  context: SlideFailureContext
): SlideGenerationFailure => {
  const details = error as {
    code?: unknown;
    message?: unknown;
    response?: { status?: unknown; data?: { message?: unknown } };
  } | null;
  const code = typeof details?.code === "string" ? details.code : undefined;
  const status = typeof details?.response?.status === "number"
    ? details.response.status : undefined;
  const serverMessage = typeof details?.response?.data?.message === "string"
    ? details.response.data.message : undefined;
  const failure: SlideGenerationFailure = {
    ...context,
    title: "Could not generate slides",
    message: "The request failed. Your document is still selected.",
    code,
    status,
    canCheckConnection: false,
  };

  if (status !== undefined) {
    const messages: Record<number, string> = {
      401: "Your session has expired. Sign in again before generating slides.",
      403: "The server denied this request. Check that your account can generate slides.",
      404: "The slide generation endpoint was not found. Check the API deployment and URL.",
      413: "The server rejected the document size. Try a smaller file or a single chapter.",
      415: "The server does not support this file type. Use a PDF, DOCX, or PPTX.",
      422: "The document could not be read. Use a text-based file rather than scanned pages.",
      429: "The slide service is rate-limited. Wait before making another request.",
      502: "The API gateway could not get a valid generation response. The service needs to recover before another attempt.",
      503: "The slide service is temporarily unavailable. Wait before trying again.",
      504: "The server or API gateway timed out while waiting for generation. A longer frontend timeout cannot extend the gateway limit.",
    };
    failure.message = serverMessage || messages[status] ||
      `The slide API returned HTTP ${status}. Your document is still selected.`;
    failure.canCheckConnection = status >= 500;
  } else if (context.offline &&
    (code === "ERR_NETWORK" || code === "ECONNABORTED" || code === "ETIMEDOUT" ||
      details?.message === "Network Error")) {
    failure.title = "You appear to be offline";
    failure.message = "The browser reports no internet connection. Reconnect before trying again; your document is still selected.";
    failure.canCheckConnection = true;
  } else if (code === "ECONNABORTED" || code === "ETIMEDOUT") {
    failure.title = "Slide request timed out";
    failure.message = "The frontend stopped waiting for a response. The API may still be processing the document. Do not repeatedly submit the same job; a server or gateway timeout requires a server-side fix.";
    failure.canCheckConnection = true;
  } else if (code === "ERR_NETWORK" || details?.message === "Network Error") {
    failure.title = "Connection interrupted";
    failure.message = context.uploadComplete
      ? "The upload finished, but the browser could not receive the generation response. A connection interruption, browser CORS block, or server/gateway disconnect can cause this. The API may still be processing the document."
      : "The browser could not receive a response from the slide API during upload. Check the connection; an unreachable API or browser CORS block can also cause this.";
    failure.canCheckConnection = true;
  } else if (code === "ERR_CANCELED") {
    failure.title = "Slide request cancelled";
    failure.message = "The request was cancelled. Your document is still selected.";
  } else if (typeof details?.message === "string") {
    failure.message = details.message;
  }

  return failure;
};

export const checkSlideConnection = async (url: string): Promise<SlideConnectionResult> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    // No credentials, document, or POST: this cannot start a generation job.
    const response = await fetch(url, {
      method: "HEAD",
      credentials: "omit",
      cache: "no-store",
      signal: controller.signal,
    });

    if (response.status === 404 || response.status >= 500) {
      return {
        reachable: false,
        message: `The API answered with HTTP ${response.status}, but the slide route or service is unavailable. This needs an API deployment/server check.`,
      };
    }

    if (response.ok && response.headers.get("content-type")?.includes("text/html")) {
      return {
        reachable: false,
        message: "The configured API URL returned an HTML page, not the slide API. Check the frontend's build-time API URL and routing.",
      };
    }

    return {
      reachable: true,
      message: "The API is reachable now. This checks connectivity only, not generation or account access. If upload succeeds but generation keeps disconnecting, the API/gateway may be cutting off the long request.",
    };
  } catch {
    return {
      reachable: false,
      message: controller.signal.aborted
        ? "The API connection check timed out after 15 seconds. Check your connection or the API server before submitting another generation job."
        : "The browser still cannot reach the API. Check internet connectivity and browser blocking; API availability, TLS, or CORS may need a server-side check.",
    };
  } finally {
    clearTimeout(timeout);
  }
};
