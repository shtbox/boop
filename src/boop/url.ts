import type { BoopUrlResolver } from "./types";

type UrlLike = {
  href?: string;
  origin?: string;
  pathname?: string;
  search?: string;
  hash?: string;
};

export const resolveUrlFromLocation = (location?: UrlLike): string | undefined => {
  if (typeof location?.href === "string" && location.href.length > 0) {
    return location.href;
  }

  if (typeof location?.origin === "string" && typeof location?.pathname === "string") {
    return `${location.origin}${location.pathname}${location.search ?? ""}${
      location.hash ?? ""
    }`;
  }

  return undefined;
};

export const defaultUrlResolver: BoopUrlResolver = () => {
  if (typeof window !== "undefined") {
    return resolveUrlFromLocation(window.location);
  }

  if (typeof globalThis !== "undefined") {
    const maybeLocation = (globalThis as { location?: UrlLike }).location;
    return resolveUrlFromLocation(maybeLocation);
  }

  return undefined;
};
