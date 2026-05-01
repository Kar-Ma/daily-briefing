import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type LLMOptions = {
  prompt: string;
  systemPrompt?: string;
  model: string;
  maxTokens?: number;
};

export async function callLLM(options: LLMOptions): Promise<string> {
  const provider = detectProvider(options.model);
  if (provider === "anthropic") return callAnthropic(options);
  return callOpenAI(options);
}

function detectProvider(model: string): "anthropic" | "openai" {
  if (model.startsWith("claude-")) return "anthropic";
  if (model.startsWith("gpt-") || model.startsWith("o")) return "openai";
  throw new Error(`Cannot detect provider from model name: ${model}`);
}

async function callAnthropic({
  prompt,
  systemPrompt,
  model,
  maxTokens,
}: LLMOptions): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const client = new Anthropic({ apiKey });
  const res = await client.messages.create({
    model,
    max_tokens: maxTokens ?? 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = res.content.find((b) => b.type === "text");
  return textBlock?.type === "text" ? textBlock.text : "";
}

async function callOpenAI({
  prompt,
  systemPrompt,
  model,
  maxTokens,
}: LLMOptions): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const client = new OpenAI({ apiKey });
  const messages: { role: "system" | "user"; content: string }[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });

  const res = await client.chat.completions.create({
    model,
    max_completion_tokens: maxTokens ?? 1024,
    messages,
  });

  return res.choices[0]?.message?.content ?? "";
}
