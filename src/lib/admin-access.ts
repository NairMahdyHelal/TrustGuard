const ADMIN_EMAILS = ["nairmahdy0602@gmail.com"] as const;

export function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? "";
}

export function isAdminEmail(email: string | null | undefined) {
  return ADMIN_EMAILS.includes(
    normalizeEmail(email) as (typeof ADMIN_EMAILS)[number],
  );
}
