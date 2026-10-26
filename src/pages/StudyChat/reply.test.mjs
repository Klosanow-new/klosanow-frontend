import assert from "node:assert/strict";
import test from "node:test";
import { formatReplyMessage, parseReplyMessage } from "./reply.ts";

test("ordinary messages and blockquotes are unchanged", () => {
  for (const text of ["Hello", "", "> A quoted line\n\nMy answer", "https://example.com/file.pdf"]) {
    assert.deepEqual(parseReplyMessage(text), { text, reply: null });
    assert.equal(formatReplyMessage(text, null), text);
  }
});

test("a reply survives text-only storage with a readable quote", () => {
  const reply = { senderName: "Ada", text: "When is the exam?" };
  const text = "Friday.\nBring your notes.";
  const stored = formatReplyMessage(text, reply);
  assert.equal(stored, "> Replying to Ada:\n> When is the exam?\n\nFriday.\nBring your notes.");
  assert.deepEqual(parseReplyMessage(stored), { text, reply });
});

test("multiline names and quotes cannot change the quote structure", () => {
  const stored = formatReplyMessage("My answer", {
    senderName: "  Ada\r\nLovelace  ",
    text: "First line\n\nSecond\tline",
  });
  assert.deepEqual(parseReplyMessage(stored), {
    text: "My answer",
    reply: { senderName: "Ada Lovelace", text: "First line Second line" },
  });
});

test("long quotes and sender names are bounded and remain parseable", () => {
  const parsed = parseReplyMessage(formatReplyMessage("Answer", {
    senderName: "A".repeat(100),
    text: "x".repeat(500),
  }));
  assert.equal(parsed.reply.senderName.length, 80);
  assert.equal(parsed.reply.text.length, 180);
  assert.ok(parsed.reply.text.endsWith("..."));
  assert.equal(parsed.text, "Answer");
});

test("empty quote details get readable fallbacks", () => {
  assert.deepEqual(parseReplyMessage(formatReplyMessage("Answer", { senderName: " ", text: "\n" })), {
    text: "Answer",
    reply: { senderName: "Unknown sender", text: "Message" },
  });
});

test("replying to a reply uses its answer rather than nesting quotes", () => {
  const first = formatReplyMessage("Friday", { senderName: "Ada", text: "Exam date?" });
  const next = formatReplyMessage("Thanks", { senderName: "Ben", text: parseReplyMessage(first).text });
  assert.deepEqual(parseReplyMessage(next), {
    text: "Thanks",
    reply: { senderName: "Ben", text: "Friday" },
  });
  assert.equal(next.includes("Exam date?"), false);
});

test("attachment URLs stay in the answer, not in its quoted preview", () => {
  const url = "https://example.com/audio-note.webm";
  const parsed = parseReplyMessage(formatReplyMessage(url, { senderName: "Ada", text: "Voice message" }));
  assert.equal(parsed.text, url);
  assert.equal(parsed.reply.text, "Voice message");
});

test("CRLF quotes are supported without modifying the answer", () => {
  assert.deepEqual(parseReplyMessage("> Replying to Ada:\r\n> Question\r\n\r\nAnswer\r\nNext line"), {
    text: "Answer\r\nNext line",
    reply: { senderName: "Ada", text: "Question" },
  });
});

test("malformed reply headers remain normal message text", () => {
  for (const text of [
    "> Replying to Ada:\n> Quote\nAnswer without separator",
    "> Replying to :\n> Quote\n\nAnswer",
    "> Replying to Ada:\n> \n\nAnswer",
    `> Replying to Ada:\n> ${"x".repeat(181)}\n\nAnswer`,
  ]) {
    assert.deepEqual(parseReplyMessage(text), { text, reply: null });
  }
});
