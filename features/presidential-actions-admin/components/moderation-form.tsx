"use client";

import { useActionState } from "react";

import {
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ACTION_IMPACT_OPTIONS,
  ACTION_SENTIMENT_OPTIONS,
  ACTION_STATUS_OPTIONS,
} from "@/features/presidential-actions-admin/constants";
import {
  initialPresidentialActionFormState,
  type PresidentialActionDetail,
  type PresidentialActionFormState,
} from "@/features/presidential-actions-admin/types";

type ModerationFormProps = {
  action: (
    prevState: PresidentialActionFormState,
    formData: FormData,
  ) => Promise<PresidentialActionFormState>;
  detail: PresidentialActionDetail;
};

export function ModerationForm({ action, detail }: ModerationFormProps) {
  const [state, formAction] = useActionState(
    action,
    initialPresidentialActionFormState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={detail.id} />

      {state.message ? (
        <Alert tone={state.status === "success" ? "success" : "error"}>
          {state.message}
        </Alert>
      ) : null}

      <FormField>
        <FormLabel htmlFor="title">Title</FormLabel>
        <Input id="title" name="title" defaultValue={detail.title} required />
        <FormMessage>{state.fieldErrors?.title?.[0]}</FormMessage>
      </FormField>

      <FormField>
        <FormLabel htmlFor="summary">Summary</FormLabel>
        <Textarea
          id="summary"
          name="summary"
          defaultValue={detail.summary ?? ""}
          required
        />
        <FormMessage>{state.fieldErrors?.summary?.[0]}</FormMessage>
      </FormField>

      <FormField>
        <FormLabel htmlFor="description">Description</FormLabel>
        <Textarea
          id="description"
          name="description"
          defaultValue={detail.description ?? ""}
          required
          className="min-h-40"
        />
        <FormMessage>{state.fieldErrors?.description?.[0]}</FormMessage>
      </FormField>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FormField>
          <FormLabel htmlFor="category">Category</FormLabel>
          <Input
            id="category"
            name="category"
            defaultValue={detail.category}
            required
          />
          <FormMessage>{state.fieldErrors?.category?.[0]}</FormMessage>
        </FormField>
        <FormField>
          <FormLabel htmlFor="sentiment">Sentiment</FormLabel>
          <Select
            id="sentiment"
            name="sentiment"
            defaultValue={detail.sentiment}
          >
            {ACTION_SENTIMENT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
          <FormMessage>{state.fieldErrors?.sentiment?.[0]}</FormMessage>
        </FormField>
        <FormField>
          <FormLabel htmlFor="impactLevel">Impact level</FormLabel>
          <Select
            id="impactLevel"
            name="impactLevel"
            defaultValue={detail.impact_level}
          >
            {ACTION_IMPACT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
          <FormMessage>{state.fieldErrors?.impactLevel?.[0]}</FormMessage>
        </FormField>
        <FormField>
          <FormLabel htmlFor="status">Status</FormLabel>
          <Select id="status" name="status" defaultValue={detail.status}>
            {ACTION_STATUS_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
          <FormMessage>{state.fieldErrors?.status?.[0]}</FormMessage>
        </FormField>
      </div>

      <FormField>
        <FormLabel htmlFor="actionDate">Action date</FormLabel>
        <Input
          id="actionDate"
          name="actionDate"
          type="date"
          defaultValue={detail.action_date ?? ""}
        />
        <FormMessage>{state.fieldErrors?.actionDate?.[0]}</FormMessage>
      </FormField>

      <SubmitButton pendingLabel="Saving changes...">
        Save moderation
      </SubmitButton>
    </form>
  );
}
