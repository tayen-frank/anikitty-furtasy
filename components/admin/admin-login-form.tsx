import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export function AdminLoginForm() {
  return (
    <main className="admin-shell min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2.5rem] bg-[#20273a] p-8 text-white shadow-panel sm:p-12">
          <p className="text-sm uppercase tracking-[0.34em] text-[#d9ba7c]">Admin Access</p>
          <h1 className="mt-4 max-w-xl text-4xl sm:text-5xl">Anikitty Furtasy Control Room</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/72">
            This route is intentionally separated from the customer-facing experience. Use it as the
            protected backend entry point for style management, Gemini configuration, and generation
            records.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/70">
            <span className="rounded-full border border-white/15 px-4 py-2">
              TODO: Real authentication
            </span>
            <span className="rounded-full border border-white/15 px-4 py-2">
              TODO: Role-based access control
            </span>
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-panel sm:p-10">
          <div className="space-y-5">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-admin-brass">Admin Login</p>
              <h2 className="mt-2 text-3xl text-admin-ink">Secure backend entry</h2>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-admin-slate">Admin Email</label>
              <input
                type="email"
                placeholder="admin@anikitty.example"
                className="w-full rounded-2xl border border-slate-200 bg-admin-cloud px-4 py-3 text-admin-ink outline-none focus:border-admin-brass"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-admin-slate">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-slate-200 bg-admin-cloud px-4 py-3 text-admin-ink outline-none focus:border-admin-brass"
              />
            </div>

            <Link href="/admin/dashboard" className={buttonStyles({ variant: "admin", fullWidth: true })}>
              Enter Dashboard
            </Link>

            <p className="text-sm leading-6 text-admin-slate">
              TODO: Replace this mock navigation with a real session-based sign-in flow and middleware
              protection for all admin routes.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
