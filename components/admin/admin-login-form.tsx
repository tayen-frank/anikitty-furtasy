"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type AdminLoginFormProps = {
  authConfigured: boolean;
};

export function AdminLoginForm({ authConfigured }: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setErrorMessage(data?.error ?? "Unable to sign in.");
        return;
      }

      router.replace("/admin/dashboard" as Route);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-shell min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2.5rem] bg-[#20273a] p-8 text-white shadow-panel sm:p-12">
          <p className="text-sm uppercase tracking-[0.34em] text-[#d9ba7c]">Admin Access</p>
          <h1 className="mt-4 max-w-xl text-4xl sm:text-5xl">Anikitty Furtasy Control Room</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/72">
            The admin panel is now protected with a signed server-side session cookie. Keep Gemini
            keys, generation settings, and privileged controls on the backend only.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/70">
            <span className="rounded-full border border-white/15 px-4 py-2">
              Signed admin session
            </span>
            <span className="rounded-full border border-white/15 px-4 py-2">
              Middleware protected dashboard
            </span>
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-panel sm:p-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-admin-brass">Admin Login</p>
              <h2 className="mt-2 text-3xl text-admin-ink">Secure backend entry</h2>
            </div>

            {!authConfigured && (
              <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-700">
                Admin auth is not configured yet. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and
                `ADMIN_SESSION_SECRET` in Vercel Environment Variables before signing in.
              </div>
            )}

            {errorMessage && (
              <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-700">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-admin-slate">Admin Email</label>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@anikitty.example"
                className="w-full rounded-2xl border border-slate-200 bg-admin-cloud px-4 py-3 text-admin-ink outline-none focus:border-admin-brass"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-admin-slate">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-slate-200 bg-admin-cloud px-4 py-3 text-admin-ink outline-none focus:border-admin-brass"
              />
            </div>

            <Button variant="admin" fullWidth type="submit" disabled={isSubmitting || !authConfigured}>
              {isSubmitting ? "Signing In..." : "Enter Dashboard"}
            </Button>

            <p className="text-sm leading-6 text-admin-slate">
              TODO: Upgrade this V1 auth flow to hashed credentials, multi-user roles, and audit logs
              before broad team usage.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
