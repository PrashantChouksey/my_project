import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Library Management System",
  description: "Neighborhood Library Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto">
            <div className="flex gap-6">
              <a href="/" className="hover:underline font-bold">Home</a>
              <a href="/books" className="hover:underline">Books</a>
              <a href="/members" className="hover:underline">Members</a>
              <a href="/borrow" className="hover:underline">Borrow/Return</a>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
