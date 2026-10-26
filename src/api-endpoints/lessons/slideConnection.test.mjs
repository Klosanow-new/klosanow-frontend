import assert from "node:assert/strict";
import test from "node:test";
import { describeSlideGenerationFailure, checkSlideConnection } from "./slideConnection.ts";

const context = { elapsedSeconds: 62, uploadComplete: true, offline: false };

test("network errors after upload preserve timing and do not claim the job never started", () => {
  const result = describeSlideGenerationFailure({ code: "ERR_NETWORK", message: "Network Error" }, context);
  assert.equal(result.title, "Connection interrupted");
  assert.equal(result.elapsedSeconds, 62);
  assert.equal(result.uploadComplete, true);
  assert.equal(result.canCheckConnection, true);
  assert.match(result.message, /upload finished/i);
  assert.match(result.message, /may still be processing/);
});

test("network errors during upload have different guidance", () => {
  const result = describeSlideGenerationFailure({ code: "ERR_NETWORK" }, { ...context, uploadComplete: false });
  assert.match(result.message, /during upload/);
  assert.doesNotMatch(result.message, /upload finished/);
});

test("an offline browser is reported for transport errors, not local validation failures", () => {
  const result = describeSlideGenerationFailure({ code: "ERR_NETWORK" }, { ...context, offline: true });
  assert.equal(result.title, "You appear to be offline");
  assert.equal(describeSlideGenerationFailure(new Error("Slide format is invalid"), { ...context, offline: true }).message, "Slide format is invalid");
});

test("both Axios timeout codes warn that API work may continue", () => {
  for (const code of ["ECONNABORTED", "ETIMEDOUT"]) {
    const result = describeSlideGenerationFailure({ code }, context);
    assert.equal(result.title, "Slide request timed out");
    assert.match(result.message, /may still be processing/);
    assert.match(result.message, /Do not repeatedly submit/);
  }
});

test("HTTP errors retain validated server messages and status", () => {
  const result = describeSlideGenerationFailure({ response: { status: 413, data: { message: "File exceeds server limit" } } }, context);
  assert.equal(result.status, 413);
  assert.equal(result.message, "File exceeds server limit");
  assert.equal(result.canCheckConnection, false);
});

test("known HTTP failures have actionable fallback messages", () => {
  for (const status of [401, 403, 404, 413, 415, 422, 429, 502, 503, 504]) {
    const result = describeSlideGenerationFailure({ response: { status, data: { message: {} } } }, context);
    assert.equal(result.status, status);
    assert.ok(result.message.length > 20);
    assert.equal(result.canCheckConnection, status >= 500);
  }
  assert.match(describeSlideGenerationFailure({ response: { status: 504 } }, context).message, /frontend timeout cannot extend/);
});

test("plain local errors and cancellation are not mislabeled as network failures", () => {
  assert.equal(describeSlideGenerationFailure(new Error("No slides came back"), context).message, "No slides came back");
  assert.equal(describeSlideGenerationFailure({ code: "ERR_CANCELED" }, context).title, "Slide request cancelled");
  assert.equal(describeSlideGenerationFailure(null, context).canCheckConnection, false);
});

test("connection check uses an unauthenticated HEAD and never uploads or generates", async (t) => {
  let captured;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    captured = { url, options };
    return new Response(null, { status: 401, headers: { "content-type": "application/json" } });
  });
  const url = "https://api.example.com/api/v1/lessons/generate-slides";
  const result = await checkSlideConnection(url);
  assert.equal(result.reachable, true);
  assert.match(result.message, /connectivity only/);
  assert.equal(captured.url, url);
  assert.equal(captured.options.method, "HEAD");
  assert.equal(captured.options.credentials, "omit");
  assert.equal(captured.options.body, undefined);
  assert.equal(captured.options.headers, undefined);
});

test("connection check detects route and gateway failures", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch");
  for (const status of [404, 502, 503, 504]) {
    fetchMock.mock.mockImplementation(async () => new Response(null, { status }));
    const result = await checkSlideConnection("https://api.example.com/lessons/generate-slides");
    assert.equal(result.reachable, false);
    assert.match(result.message, new RegExp(`HTTP ${status}`));
  }
});

test("a successful SPA HTML response is not mistaken for the API", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 200, headers: { "content-type": "text/html" } }));
  const result = await checkSlideConnection("https://example.com/lessons/generate-slides");
  assert.equal(result.reachable, false);
  assert.match(result.message, /HTML page/);
});

test("connection failure is reported without leaking raw fetch exceptions", async (t) => {
  t.mock.method(globalThis, "fetch", async () => { throw new TypeError("Failed to fetch"); });
  const result = await checkSlideConnection("https://api.example.com/lessons/generate-slides");
  assert.equal(result.reachable, false);
  assert.match(result.message, /browser still cannot reach/);
});

test("connection check aborts at 15 seconds and does not retry", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let calls = 0;
  t.mock.method(globalThis, "fetch", (_url, options) => new Promise((_resolve, reject) => {
    calls += 1;
    options.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
  }));
  const pending = checkSlideConnection("https://api.example.com/lessons/generate-slides");
  t.mock.timers.tick(15000);
  const result = await pending;
  assert.equal(result.reachable, false);
  assert.match(result.message, /timed out after 15 seconds/);
  assert.equal(calls, 1);
});
