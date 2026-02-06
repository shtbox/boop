export const mergeClassNames = (base: string, custom?: string) =>
  [base, custom].filter(Boolean).join(" ");

export const isValidEmail = (value: string) => {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};
