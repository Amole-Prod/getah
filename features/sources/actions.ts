"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import {
  createSource,
  removeSource,
  updateSource,
} from "@/features/sources/repository";
import { sourceSchema } from "@/features/sources/schemas";
import {
  initialSourceFormState,
  type SourceFormState,
} from "@/features/sources/types";

function parseSourceFormData(formData: FormData) {
  return sourceSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    url: formData.get("url"),
    type: formData.get("type"),
    isActive: formData.get("isActive") === "on",
  });
}

export async function createSourceAction(
  _prevState: SourceFormState,
  formData: FormData,
) {
  const parsed = parseSourceFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Source data invalid.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    } satisfies SourceFormState;
  }

  try {
    const user = await requireUser();
    await createSource(parsed.data, user.id);
    revalidatePath("/admin/sources");

    return {
      ...initialSourceFormState,
      status: "success",
      message: "Source created.",
    } satisfies SourceFormState;
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Failed to create source.",
    } satisfies SourceFormState;
  }
}

export async function updateSourceAction(
  _prevState: SourceFormState,
  formData: FormData,
) {
  const parsed = parseSourceFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Source data invalid.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    } satisfies SourceFormState;
  }

  try {
    const user = await requireUser();
    await updateSource(parsed.data, user.id);
    revalidatePath("/admin/sources");
    revalidatePath(`/admin/sources/${parsed.data.id}/edit`);

    return {
      ...initialSourceFormState,
      status: "success",
      message: "Source updated.",
    } satisfies SourceFormState;
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Failed to update source.",
    } satisfies SourceFormState;
  }
}

export async function deleteSourceAction(formData: FormData) {
  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    throw new Error("Missing source id.");
  }

  await requireUser();
  await removeSource(id);
  revalidatePath("/admin/sources");
}
