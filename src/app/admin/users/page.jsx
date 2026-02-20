"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

async function fetchJSON(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || "Request failed");
  }
  return json;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  async function load(nextPage = page) {
    setError("");
    setLoading(true);

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

      const data = await fetchJSON(`/api/admin/users?page=${nextPage}&limit=${limit}`, token);
      setUsers(data?.data?.users || []);
      setTotal(data?.data?.total || 0);
      setPage(data?.data?.page || nextPage);
    } catch (err) {
      setError(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function deleteUser(id) {
    try {
      const token = localStorage.getItem("qirin_token");
      if (!token) {
        router.replace("/admin/login");
        return;
      }

      await fetchJSON(`/api/admin/users/${id}`, token, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setError(err?.message || "Failed to delete user");
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="mt-1 text-sm text-gray-600">Admin management</p>
        </div>
        <div className="space-x-4 text-sm">
          <a className="text-blue-600 hover:underline" href="/admin/dashboard">
            Dashboard
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

      {!loading ? (
        <div className="mt-6">
          <div className="flex items-center justify-between rounded-xl border bg-white p-3 text-sm text-gray-700">
            <div>
              Total: <span className="font-medium">{total}</span>
            </div>
            <div className="space-x-2">
              <button
                className="rounded-md border px-3 py-1 disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => load(page - 1)}
              >
                Prev
              </button>
              <button
                className="rounded-md border px-3 py-1 disabled:opacity-50"
                disabled={page * limit >= total}
                onClick={() => load(page + 1)}
              >
                Next
              </button>
            </div>
          </div>

          <div className="mt-3 overflow-hidden rounded-xl border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t">
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.role}</td>
                    <td className="px-4 py-3">
                      {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="rounded-md border border-red-200 px-3 py-1 text-red-700 hover:bg-red-50"
                        onClick={() => deleteUser(u._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!users.length ? (
                  <tr>
                    <td className="px-4 py-6 text-gray-600" colSpan={5}>
                      No users.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </main>
  );
}
