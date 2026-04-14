/**
 * Example B — Streaming responses
 *
 * Instead of waiting for the full response, tokens arrive as they are
 * generated. This is what chat apps use to show text appearing in real time.
 *
 * Run: npm run stream
 */

import { anthropic } from "./client.js";

async function streamChat(userMessage: string) {
  console.log(`User: ${userMessage}\n`);
  process.stdout.write("Claude: ");

  // client.messages.stream() opens the SSE connection and gives you
  // an async iterator of events. We handle only text_delta here,
  // but the stream also emits message_start, content_block_start, etc.
  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: "You are a concise and clear technical writer.",
    messages: [{ role: "user", content: userMessage }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      process.stdout.write(event.delta.text);
    }
  }

  // After the loop, get the fully assembled message for metadata
  const finalMessage = await stream.finalMessage();
  console.log("\n\n---");
  console.log(`Input tokens:  ${finalMessage.usage.input_tokens}`);
  console.log(`Output tokens: ${finalMessage.usage.output_tokens}`);
}

await streamChat(
  "Explain the difference between async/await and Promises in 3 sentences.",
);
