"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Login failed");
      }

      const token = json?.data?.token;
      const role = json?.data?.user?.role;
      if (!token) throw new Error("Missing token");

      localStorage.setItem("qirin_token", token);

      if (role !== "admin") {
        throw new Error("Admin access required");
      }

      router.replace("/admin/dashboard");
    } catch (err) {
      setError(err?.message || "Login failed");
      localStorage.removeItem("qirin_token");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <p className="mt-1 text-sm text-gray-600">Qirin Health</p>

        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-black disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
