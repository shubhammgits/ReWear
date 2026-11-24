// Gives an account admin rights. The person must have signed in on the site once first.
// Usage: node --env-file=.env.local scripts/make-admin.mjs you@example.com
const email = process.argv[2]?.toLowerCase();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!email || !url || !key) {
  console.error("Usage: node --env-file=.env.local scripts/make-admin.mjs you@example.com");
  process.exit(1);
}
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

let user;
for (let page = 1; !user; page++) {
  const res = await fetch(`${url}/auth/v1/admin/users?page=${page}&per_page=200`, { headers });
  const { users } = await res.json();
  if (!users?.length) break;
  user = users.find((u) => u.email?.toLowerCase() === email);
}
if (!user) {
  console.error(`No account for ${email} yet. Sign in on the site once with that email, then run this again.`);
  process.exit(1);
}
const res = await fetch(`${url}/rest/v1/profiles?id=eq.${user.id}`, { method: "PATCH", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify({ role: "admin" }) });
const rows = await res.json();
console.log(rows.length ? `${email} is now an admin. Open /admin.` : `Couldn't update the profile: ${JSON.stringify(rows)}`);
