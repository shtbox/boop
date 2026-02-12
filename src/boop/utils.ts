export const mergeClassNames = (base: string, custom?: string) =>
  [base, custom].filter(Boolean).join(" ");

let emailInput: HTMLInputElement | undefined;

const getEmailInput = () => {
  if (typeof document === "undefined") {
    return undefined;
  }
  if (!emailInput) {
    emailInput = document.createElement("input");
    emailInput.type = "email";
  }
  return emailInput;
};

export const isValidEmail = (value: string) => {
  if (!value) {
    return true;
  }

  const input = getEmailInput();
  if (!input) {
    return true;
  }
  input.value = value;
  return input.checkValidity();
};
