# anthropic-sdk-playground

A minimal TypeScript playground for learning the Anthropic SDK — covering messages, streaming, and tool use from the ground up, no frameworks.

## Examples

| Script | File | What it covers |
|---|---|---|
| `npm run chat` | `src/chat.ts` | `messages.create()`, system prompts, configurable personalities |
| `npm run stream` | `src/stream.ts` | `messages.stream()`, token-by-token output, `finalMessage()` |
| `npm run tools` | `src/tools.ts` | Tool declaration, `tool_use` blocks, agentic loop, `tool_result` |

## Setup

```bash
npm install
cp .env.example .env
# Add your key to .env: ANTHROPIC_API_KEY=sk-ant-...
```

Get your API key at [console.anthropic.com](https://console.anthropic.com).

## Run

```bash
npm run chat
npm run stream
npm run tools
```

## Stack

- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- TypeScript + tsx (no build step)
- Node.js 20+
