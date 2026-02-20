export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Qirin Health</h1>
      <p className="mt-2 text-gray-700">Backend API + Admin Panel is ready.</p>
      <div className="mt-6 rounded-lg border bg-white p-4">
        <p className="font-medium">Admin Panel</p>
        <a className="mt-2 inline-block text-blue-600 hover:underline" href="/admin/login">
          Go to /admin/login
        </a>
      </div>
    </main>
  );
}
