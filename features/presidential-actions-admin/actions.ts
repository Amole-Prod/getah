"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { presidentialActionFormSchema } from "@/features/presidential-actions-admin/schema";
import {
  initialPresidentialActionFormState,
  type PresidentialActionFormState,
} from "@/features/presidential-actions-admin/types";
import {
  setPresidentialActionPublishState,
  updatePresidentialAction,
} from "@/features/presidential-actions-admin/repository";

export async function updatePresidentialActionAction(
  _prevState: PresidentialActionFormState,
  formData: FormData,
) {
  const parsed = presidentialActionFormSchema.safeParse({
    actionDate: formData.get("actionDate"),
    category: formData.get("category"),
    description: formData.get("description"),
    id: formData.get("id"),
    impactLevel: formData.get("impactLevel"),
    sentiment: formData.get("sentiment"),
    status: formData.get("status"),
    summary: formData.get("summary"),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Action data invalid.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    } satisfies PresidentialActionFormState;
  }

  try {
    await requireUser();
    await updatePresidentialAction(parsed.data);
    revalidatePath("/admin/presidential-actions");
    revalidatePath(`/admin/presidential-actions/${parsed.data.id}`);

    return {
      ...initialPresidentialActionFormState,
      status: "success",
      message: "Presidential action updated.",
    } satisfies PresidentialActionFormState;
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Failed to update action.",
    } satisfies PresidentialActionFormState;
  }
}

export async function togglePresidentialActionPublishAction(
  formData: FormData,
) {
  const id = formData.get("id");
  const nextStatus = formData.get("nextStatus");

  if (
    typeof id !== "string" ||
    (nextStatus !== "draft" && nextStatus !== "published")
  ) {
    throw new Error("Invalid publish action payload.");
  }

  await requireUser();
  await setPresidentialActionPublishState(id, nextStatus);
  revalidatePath("/admin/presidential-actions");
  revalidatePath(`/admin/presidential-actions/${id}`);
}
