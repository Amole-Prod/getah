"use client";

import { useActionState } from "react";

import { Alert } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { SOURCE_TYPE_OPTIONS } from "@/features/sources/constants";
import {
  initialSourceFormState,
  type SourceFormState,
  type SourceFormValues,
} from "@/features/sources/types";

type SourceFormProps = {
  action: (
    prevState: SourceFormState,
    formData: FormData,
  ) => Promise<SourceFormState>;
  defaultValues?: SourceFormValues;
  submitLabel: string;
  pendingLabel: string;
};

const emptyValues: SourceFormValues = {
  name: "",
  url: "",
  type: "news_portal",
  isActive: true,
};

export function SourceForm({
  action,
  defaultValues = emptyValues,
  submitLabel,
  pendingLabel,
}: SourceFormProps) {
  const [state, formAction] = useActionState(action, initialSourceFormState);

  return (
    <form action={formAction} className="space-y-4">
      {defaultValues.id ? (
        <input type="hidden" name="id" value={defaultValues.id} />
      ) : null}

      {state.message ? (
        <Alert tone={state.status === "success" ? "success" : "error"}>
          {state.message}
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField className="md:col-span-2">
          <FormLabel htmlFor="name">Name</FormLabel>
          <Input
            id="name"
            name="name"
            defaultValue={defaultValues.name}
            required
          />
          <FormMessage>{state.fieldErrors?.name?.[0]}</FormMessage>
        </FormField>

        <FormField className="md:col-span-2">
          <FormLabel htmlFor="url">URL</FormLabel>
          <Input
            id="url"
            name="url"
            type="url"
            defaultValue={defaultValues.url}
            placeholder="https://example.com"
            required
          />
          <FormMessage>{state.fieldErrors?.url?.[0]}</FormMessage>
        </FormField>

        <FormField>
          <FormLabel htmlFor="type">Type</FormLabel>
          <Select id="type" name="type" defaultValue={defaultValues.type}>
            {SOURCE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <FormMessage>{state.fieldErrors?.type?.[0]}</FormMessage>
        </FormField>

        <FormField>
          <FormLabel htmlFor="isActive">Status</FormLabel>
          <label className="border-border/70 flex h-11 items-center gap-3 rounded-2xl border px-4 text-sm text-slate-200">
            <Checkbox
              id="isActive"
              name="isActive"
              defaultChecked={defaultValues.isActive}
            />
            Active source
          </label>
        </FormField>
      </div>

      <SubmitButton className="w-full sm:w-auto" pendingLabel={pendingLabel}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
