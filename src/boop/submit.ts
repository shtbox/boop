import type { BoopCallbacks, BoopSubmitPayload, BoopUrlResolver } from "./types";
import { defaultUrlResolver } from "./url";
import { isValidEmail } from "./utils";

export type BoopSubmitRequest = {
  endpoint: string;
  payload: BoopSubmitPayload;
  callbacks?: BoopCallbacks;
  metadata?: Record<string, unknown>;
  urlResolver?: BoopUrlResolver;
};

export const submitBoopFeedback = async ({
  endpoint,
  payload,
  callbacks,
  metadata,
  urlResolver
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
    payload.url ?? urlResolver?.() ?? defaultUrlResolver();

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
