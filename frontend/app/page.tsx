export default function Home() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Library Management System</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/books" className="border p-6 rounded hover:bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">📚 Books</h2>
          <p className="text-gray-600">Manage library books</p>
        </a>

        <a href="/members" className="border p-6 rounded hover:bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">👥 Members</h2>
          <p className="text-gray-600">Manage library members</p>
        </a>

        <a href="/borrow" className="border p-6 rounded hover:bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">🔄 Borrow/Return</h2>
          <p className="text-gray-600">Handle book transactions</p>
        </a>
      </div>
    </div>
  );
}
