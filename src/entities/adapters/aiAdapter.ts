import type { AICoachAdapter } from "./aiCoachAdapter";
import { mockAiCoachAdapter } from "./mockAiCoachAdapter";
import { realAiCoachAdapter } from "./realAiCoachAdapter";

export const aiCoachAdapter: AICoachAdapter =
  process.env.NEXT_PUBLIC_AI_MODE === "real"
    ? realAiCoachAdapter
    : mockAiCoachAdapter;
