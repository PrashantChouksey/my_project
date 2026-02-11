'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Book {
    id: number;
    title: string;
    author: string;
    isbn: string | null;
    available_copies: number;
}

export default function BooksPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        available_copies: 1
    });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const res = await fetch(`${API_URL}/api/books`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setBooks(data);
            setError(null);
        } catch (err) {
            setError('Failed to connect to backend. Is the server running?');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            await fetch(`${API_URL}/api/books/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        } else {
            await fetch(`${API_URL}/api/books`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        }

        setFormData({ title: '', author: '', isbn: '', available_copies: 1 });
        setShowForm(false);
        setEditingId(null);
        fetchBooks();
    };

    const handleEdit = (book: Book) => {
        setFormData({
            title: book.title,
            author: book.author,
            isbn: book.isbn || '',
            available_copies: book.available_copies
        });
        setEditingId(book.id);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this book?')) {
            await fetch(`${API_URL}/api/books/${id}`, { method: 'DELETE' });
            fetchBooks();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Books</h1>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                        setFormData({ title: '', author: '', isbn: '', available_copies: 1 });
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    {showForm ? 'Cancel' : 'Add Book'}
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="border p-2 rounded"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Author"
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                            className="border p-2 rounded"
                            required
                        />
                        <input
                            type="text"
                            placeholder="ISBN"
                            value={formData.isbn}
                            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                            className="border p-2 rounded"
                        />
                        <input
                            type="number"
                            placeholder="Available Copies"
                            value={formData.available_copies}
                            onChange={(e) => setFormData({ ...formData, available_copies: parseInt(e.target.value) })}
                            className="border p-2 rounded"
                            required
                            min="0"
                        />
                    </div>
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded mt-4">
                        {editingId ? 'Update' : 'Create'} Book
                    </button>
                </form>
            )}

            <table className="w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2 text-left">ID</th>
                        <th className="border p-2 text-left">Title</th>
                        <th className="border p-2 text-left">Author</th>
                        <th className="border p-2 text-left">ISBN</th>
                        <th className="border p-2 text-left">Available</th>
                        <th className="border p-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map((book) => (
                        <tr key={book.id}>
                            <td className="border p-2">{book.id}</td>
                            <td className="border p-2">{book.title}</td>
                            <td className="border p-2">{book.author}</td>
                            <td className="border p-2">{book.isbn || '-'}</td>
                            <td className="border p-2">{book.available_copies}</td>
                            <td className="border p-2">
                                <button
                                    onClick={() => handleEdit(book)}
                                    className="text-blue-600 hover:underline mr-2"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(book.id)}
                                    className="text-red-600 hover:underline"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
