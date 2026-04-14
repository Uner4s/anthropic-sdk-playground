/**
 * Example C — Tool use
 *
 * Claude can call functions you define. When it needs data it does not have
 * (e.g., current weather, a DB lookup), it responds with a tool_use block
 * instead of text. You execute the function and send the result back.
 * Claude then uses that result to compose the final answer.
 *
 * Flow:
 *   1. You → Claude (with tools declared + user question)
 *   2. Claude → You (stop_reason: "tool_use", with a tool_use block)
 *   3. You execute the tool
 *   4. You → Claude (messages include the tool_result)
 *   5. Claude → You (stop_reason: "end_turn", with final text answer)
 *
 * Run: npm run tools
 */

import Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "./client.js";

// --- Tool definitions (JSON Schema) ---
const tools: Anthropic.Tool[] = [
  {
    name: "get_weather",
    description:
      "Returns the current weather for a city. Use this when the user asks about weather.",
    input_schema: {
      type: "object" as const,
      properties: {
        city: {
          type: "string",
          description: "The city name, e.g. 'Santiago' or 'Buenos Aires'",
        },
        unit: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
          description: "Temperature unit. Defaults to celsius.",
        },
      },
      required: ["city"],
    },
  },
  {
    name: "calculate",
    description:
      "Evaluates a basic math expression. Use this for arithmetic the user asks you to compute.",
    input_schema: {
      type: "object" as const,
      properties: {
        expression: {
          type: "string",
          description: "A math expression, e.g. '42 * 1.19' or '(100 - 20) / 4'",
        },
      },
      required: ["expression"],
    },
  },
];

// --- Fake tool implementations ---
function getWeather(city: string, unit: "celsius" | "fahrenheit" = "celsius") {
  // In a real app you would call a weather API here
  const temp = unit === "celsius" ? 22 : 72;
  return { city, temperature: temp, unit, condition: "Partly cloudy" };
}

function calculate(expression: string) {
  // WARNING: eval() is used here only for demo purposes.
  // Never use eval() with untrusted input in production.
  try {
    // eslint-disable-next-line no-eval
    const result = eval(expression) as number;
    return { expression, result };
  } catch {
    return { expression, error: "Invalid expression" };
  }
}

// --- Dispatch table ---
function executeTool(name: string, input: Record<string, unknown>) {
  switch (name) {
    case "get_weather":
      return getWeather(
        input.city as string,
        input.unit as "celsius" | "fahrenheit" | undefined
      );
    case "calculate":
      return calculate(input.expression as string);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// --- Agentic loop ---
async function runWithTools(userMessage: string) {
  console.log(`User: ${userMessage}\n`);

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userMessage },
  ];

  // Keep looping until Claude stops asking for tools
  while (true) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      tools,
      messages,
    });

    if (response.stop_reason === "end_turn") {
      // Claude is done — print the final text
      for (const block of response.content) {
        if (block.type === "text") {
          console.log(`Claude: ${block.text}`);
        }
      }
      break;
    }

    if (response.stop_reason === "tool_use") {
      // Push Claude's response (with tool_use blocks) to message history
      messages.push({ role: "assistant", content: response.content });

      // Execute each tool Claude requested
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type === "tool_use") {
          console.log(`  [tool] calling ${block.name}(${JSON.stringify(block.input)})`);
          const result = executeTool(block.name, block.input as Record<string, unknown>);
          console.log(`  [tool] result: ${JSON.stringify(result)}\n`);

          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        }
      }

      // Send tool results back to Claude
      messages.push({ role: "user", content: toolResults });
    }
  }
}

// Ask Claude something that requires both tools
await runWithTools(
  "What's the weather in Santiago right now? And what's 1500 * 1.19?"
);
