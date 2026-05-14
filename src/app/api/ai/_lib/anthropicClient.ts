import Anthropic from "@anthropic-ai/sdk";
import type { TextBlock } from "@anthropic-ai/sdk/resources/messages";

let anthropicClient: Anthropic | null = null;

const getAnthropicClient = (): Anthropic => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }

  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey });
  }

  return anthropicClient;
};

export type ClaudeJsonRequest = {
  model: string;
  maxTokens: number;
  system: string;
  prompt: string;
};

export async function createClaudeJsonText({
  model,
  maxTokens,
  system,
  prompt,
}: ClaudeJsonRequest): Promise<string> {
  const message = await getAnthropicClient().messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: prompt }],
  });
  const textBlock = message.content.find(
    (block): block is TextBlock => block.type === "text",
  );

  return textBlock?.text.trim() ?? "";
}
