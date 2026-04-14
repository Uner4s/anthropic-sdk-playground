/**
 * Example A — Simple chat with configurable personality
 *
 * The system prompt is the personality. Change it and Claude's
 * tone, role, and behavior changes completely.
 *
 * Run: npm run chat
 */

import { anthropic } from "./client.js";

// --- Personality presets ---
const PERSONALITIES = {
  tutor: `You are a patient and encouraging programming tutor.
You explain concepts step by step, using simple analogies.
When the user gets something right, you celebrate with them.
Always ask at the end: "Does that make sense? Want to try an exercise?"`,

  interviewer: `You are a senior software engineer conducting a technical interview.
Ask one question at a time. After the user answers, give brief feedback
(positive or constructive) before moving to the next question.
Start by saying: "Let's begin. Tell me about a challenging technical problem you solved recently."`,

  reviewer: `You are a strict but fair code reviewer.
You point out bugs, anti-patterns, and missing edge cases.
You also acknowledge what is done well. Be concise and direct.
Format feedback as: ✓ Good / ✗ Issue / ? Question`,
} as const;

type Personality = keyof typeof PERSONALITIES;

// --- Main ---
async function chat(userMessage: string, personality: Personality = "tutor") {
  const systemPrompt = PERSONALITIES[personality];

  console.log(`\n[Personality: ${personality}]\n`);
  console.log(`User: ${userMessage}\n`);
  console.log("Claude:");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  // message.content is an array of content blocks
  for (const block of message.content) {
    if (block.type === "text") {
      console.log(block.text);
    }
  }

  console.log("\n---");
  console.log(`Input tokens:  ${message.usage.input_tokens}`);
  console.log(`Output tokens: ${message.usage.output_tokens}`);
  console.log(`Stop reason:   ${message.stop_reason}`);
}

// Try each personality with a different question
await chat("What is a closure in JavaScript?", "tutor");
await chat("What is a closure in JavaScript?", "reviewer");
