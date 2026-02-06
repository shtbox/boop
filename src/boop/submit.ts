import type { BoopCallbacks, BoopSubmitPayload } from "./types";
import { isValidEmail } from "./utils";

export type BoopSubmitRequest = {
  endpoint: string;
  payload: BoopSubmitPayload;
  callbacks?: BoopCallbacks;
  metadata?: Record<string, unknown>;
};

export const submitBoopFeedback = async ({
  endpoint,
  payload,
  callbacks,
  metadata
}: BoopSubmitRequest): Promise<Response> => {
  const message = payload.message?.trim();

  if (!message) {
    const errorMessage = "Please add a feedback message.";
    callbacks?.onValidationError?.("message", errorMessage);
    throw new Error(errorMessage);
  }

  if (!isValidEmail(payload.email ?? "")) {
    const errorMessage = "Please provide a valid email address.";
    callbacks?.onValidationError?.("email", errorMessage);
    throw new Error(errorMessage);
  }

  callbacks?.onSubmitStart?.();

  const resolvedMetadata =
    metadata || payload.metadata
      ? { ...(metadata ?? {}), ...(payload.metadata ?? {}) }
      : undefined;
  const resolvedUrl =
    payload.url ?? (typeof window !== "undefined" ? window.location.href : undefined);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: resolvedUrl,
        name: payload.name?.trim() || undefined,
        email: payload.email?.trim() || undefined,
        message,
        metadata: resolvedMetadata
      })
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    callbacks?.onSubmitSuccess?.(response);
    return response;
  } catch (error) {
    const submitError = error instanceof Error ? error : new Error("Submit failed.");
    callbacks?.onSubmitError?.(submitError);
    throw submitError;
  }
};
