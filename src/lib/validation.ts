export function isEmailValid(email: unknown): boolean {
  if (typeof email !== "string") return false;

  // Quick, conservative validation:
  // - must contain exactly one '@'
  // - local and domain parts must be non-empty
  // - domain must contain a dot (e.g. example.com)
  const parts = email.split("@");
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (!local || !domain) return false;

  if (!domain.includes(".")) return false;

  return true;
}

export function validateUserCredential(credential: { email?: unknown }) {
  const email = credential?.email;
  if (!isEmailValid(email)) {
    throw new Error("Invalid email");
  }
  return true;
}
