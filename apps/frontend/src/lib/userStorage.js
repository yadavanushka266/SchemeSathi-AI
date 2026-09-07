/* Wizard data (personal/business/other details) used to live under one
   fixed localStorage key shared by everyone on the browser. That meant
   signing out and signing in as a different account still showed the
   previous account's leftover answers. These helpers scope every wizard
   key to whichever account is currently signed in, so each account's
   data is isolated -- and switching back to an earlier account later
   correctly restores that account's own data instead of losing it.

   Note: the demo auth system only remembers one *registered* account at
   a time (see SignUpPage) -- there's no backend beneficiary account
   system yet, so this fixes data bleeding within a session/browser, not
   true multi-account storage. That would need real accounts on the
   backend (see modules/auth, which today is staff-only). */

function getCurrentUserId() {
  try {
    const raw = localStorage.getItem("schemeSaathiUser");
    const isLoggedIn = localStorage.getItem("schemeSaathiLoggedIn") === "true";
    if (!isLoggedIn || !raw) return "guest";

    const user = JSON.parse(raw);
    return user?.mobile || user?.email || "guest";
  } catch {
    return "guest";
  }
}

function scopedKey(baseKey) {
  return `${baseKey}::${getCurrentUserId()}`;
}

export function getUserItem(baseKey) {
  try {
    const raw = localStorage.getItem(scopedKey(baseKey));
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error(`Unable to read ${baseKey}:`, error);
    return null;
  }
}

export function setUserItem(baseKey, value) {
  localStorage.setItem(scopedKey(baseKey), JSON.stringify(value));
}

export function removeUserItem(baseKey) {
  localStorage.removeItem(scopedKey(baseKey));
}

export function hasCompletedWizardProfile() {
  const personal = getUserItem("schemeSaathiPersonalDetails");
  return Boolean(personal?.phoneNumber);
}
