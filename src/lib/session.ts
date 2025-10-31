import type { User } from "./types";

export type AuthSession = {
  user: Pick<User, "id" | "email" | "nickname"> | null;
  loading: boolean;
  route: string;
};

const DASHBOARD_ROUTE = "/dashboard";

export function hasActiveUser(
  session: AuthSession
): session is AuthSession & { user: User; loading: false } {
  if (session.loading) return false;
  if (session.route !== DASHBOARD_ROUTE) return false;

  const user = session.user;
  if (!user) return false;

  const hasId = typeof user.id === "string" && user.id.trim().length > 0;
  const hasEmail = typeof user.email === "string" && user.email.trim().length > 0;

  return hasId && hasEmail;
}
