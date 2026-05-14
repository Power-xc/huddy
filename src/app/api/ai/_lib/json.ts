export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const parseJsonText = (value: string): unknown => JSON.parse(value);

export const jsonError = (message: string, status: number): Response =>
  Response.json({ error: message }, { status });
