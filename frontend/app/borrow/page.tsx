'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Book {
    id: number;
    title: string;
    author: string;
    available_copies: number;
}

interface Member {
    id: number;
    name: string;
    email: string;
}

interface BorrowingRecord {
    id: number;
    book_id: number;
    member_id: number;
    borrow_date: string;
    return_date: string | null;
    book: Book;
    member: Member;
}

export default function BorrowPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [borrowedBooks, setBorrowedBooks] = useState<BorrowingRecord[]>([]);
    const [selectedBook, setSelectedBook] = useState('');
    const [selectedMember, setSelectedMember] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [booksRes, membersRes, borrowedRes] = await Promise.all([
                fetch(`${API_URL}/api/books`),
                fetch(`${API_URL}/api/members`),
                fetch(`${API_URL}/api/borrowed-books`)
            ]);

            if (!booksRes.ok || !membersRes.ok || !borrowedRes.ok) throw new Error('Failed to fetch');

            setBooks(await booksRes.json());
            setMembers(await membersRes.json());
            setBorrowedBooks(await borrowedRes.json());
            setError(null);
        } catch (err) {
            setError('Failed to connect to backend.');
        }
    };

    const handleBorrow = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch(`${API_URL}/api/borrow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    book_id: parseInt(selectedBook),
                    member_id: parseInt(selectedMember)
                })
            });

            if (res.ok) {
                alert('Book borrowed successfully!');
                setSelectedBook('');
                setSelectedMember('');
                fetchData();
            } else {
                const error = await res.json();
                alert(error.detail || 'Failed to borrow book');
            }
        } catch (error) {
            alert('Error borrowing book');
        }
    };

    const handleReturn = async (recordId: number) => {
        try {
            const res = await fetch(`${API_URL}/api/return/${recordId}`, {
                method: 'POST'
            });

            if (res.ok) {
                alert('Book returned successfully!');
                fetchData();
            } else {
                const error = await res.json();
                alert(error.detail || 'Failed to return book');
            }
        } catch (error) {
            alert('Error returning book');
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Borrow/Return Books</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="bg-gray-50 p-6 rounded mb-6">
                <h2 className="text-xl font-semibold mb-4">Borrow a Book</h2>
                <form onSubmit={handleBorrow}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block mb-2">Select Book:</label>
                            <select
                                value={selectedBook}
                                onChange={(e) => setSelectedBook(e.target.value)}
                                className="border p-2 rounded w-full"
                                required
                            >
                                <option value="">Choose a book...</option>
                                {books.filter(b => b.available_copies > 0).map(book => (
                                    <option key={book.id} value={book.id}>
                                        {book.title} by {book.author} (Available: {book.available_copies})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-2">Select Member:</label>
                            <select
                                value={selectedMember}
                                onChange={(e) => setSelectedMember(e.target.value)}
                                className="border p-2 rounded w-full"
                                required
                            >
                                <option value="">Choose a member...</option>
                                {members.map(member => (
                                    <option key={member.id} value={member.id}>
                                        {member.name} ({member.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded"
                    >
                        Borrow Book
                    </button>
                </form>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">Currently Borrowed Books</h2>
                {borrowedBooks.length === 0 ? (
                    <p className="text-gray-500">No books currently borrowed</p>
                ) : (
                    <table className="w-full border-collapse border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2 text-left">Book</th>
                                <th className="border p-2 text-left">Member</th>
                                <th className="border p-2 text-left">Borrow Date</th>
                                <th className="border p-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {borrowedBooks.map((record) => (
                                <tr key={record.id}>
                                    <td className="border p-2">
                                        {record.book.title} by {record.book.author}
                                    </td>
                                    <td className="border p-2">{record.member.name}</td>
                                    <td className="border p-2">{record.borrow_date}</td>
                                    <td className="border p-2">
                                        <button
                                            onClick={() => handleReturn(record.id)}
                                            className="bg-green-600 text-white px-4 py-1 rounded"
                                        >
                                            Return Book
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
