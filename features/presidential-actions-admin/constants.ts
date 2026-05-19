import type {
  ActionImpactLevel,
  ActionSentiment,
  ActionStatus,
} from "@/features/presidential-actions-admin/types";

export const ACTION_SENTIMENT_OPTIONS: Array<{
  label: string;
  value: ActionSentiment;
}> = [
  { value: "positive", label: "Positive" },
  { value: "neutral", label: "Neutral" },
  { value: "negative", label: "Negative" },
  { value: "mixed", label: "Mixed" },
];

export const ACTION_IMPACT_OPTIONS: Array<{
  label: string;
  value: ActionImpactLevel;
}> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export const ACTION_STATUS_OPTIONS: Array<{
  label: string;
  value: ActionStatus;
}> = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];
