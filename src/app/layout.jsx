import "./globals.css";

export const metadata = {
  title: "Qirin Health",
  description: "Qirin Health tracking system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
