"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

async function fetchJSON(url, token) {
  const res = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || "Request failed");
  }
  return json;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWeightLogs: 0,
    totalBloodPressureLogs: 0,
    totalGlucoseLogs: 0,
  });

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const token = localStorage.getItem("qirin_token");
        if (!token) {
          router.replace("/admin/login");
          return;
        }

        const me = await fetchJSON("/api/auth/me", token);
        if (me?.data?.role !== "admin") {
          localStorage.removeItem("qirin_token");
          router.replace("/admin/login");
          return;
        }

        const statsRes = await fetchJSON("/api/admin/stats", token);

        if (!mounted) return;
        setStats({
          totalUsers: statsRes?.data?.totalUsers || 0,
          totalWeightLogs: statsRes?.data?.totalWeightLogs || 0,
          totalBloodPressureLogs: statsRes?.data?.totalBloodPressureLogs || 0,
          totalGlucoseLogs: statsRes?.data?.totalGlucoseLogs || 0,
        });
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Failed to load dashboard");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="space-x-4 text-sm">
          <a className="text-blue-600 hover:underline" href="/admin/users">
            Manage Users
          </a>
          <button
            className="rounded-md border px-3 py-1 hover:bg-gray-50"
            onClick={() => {
              localStorage.removeItem("qirin_token");
              router.replace("/admin/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {loading ? <p className="mt-6 text-gray-600">Loading...</p> : null}

      {error ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="mt-1 text-3xl font-semibold">{stats.totalUsers}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-600">Total Weight Logs</p>
            <p className="mt-1 text-3xl font-semibold">{stats.totalWeightLogs}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-600">Total Blood Pressure Logs</p>
            <p className="mt-1 text-3xl font-semibold">{stats.totalBloodPressureLogs}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-600">Total Glucose Logs</p>
            <p className="mt-1 text-3xl font-semibold">{stats.totalGlucoseLogs}</p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
