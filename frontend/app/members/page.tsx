'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Member {
    id: number;
    name: string;
    email: string;
    phone: string | null;
}

export default function MembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await fetch(`${API_URL}/api/members`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setMembers(data);
            setError(null);
        } catch (err) {
            setError('Failed to connect to backend.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            await fetch(`${API_URL}/api/members/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        } else {
            await fetch(`${API_URL}/api/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        }

        setFormData({ name: '', email: '', phone: '' });
        setShowForm(false);
        setEditingId(null);
        fetchMembers();
    };

    const handleEdit = (member: Member) => {
        setFormData({
            name: member.name,
            email: member.email,
            phone: member.phone || ''
        });
        setEditingId(member.id);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this member?')) {
            await fetch(`${API_URL}/api/members/${id}`, { method: 'DELETE' });
            fetchMembers();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Members</h1>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                        setFormData({ name: '', email: '', phone: '' });
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    {showForm ? 'Cancel' : 'Add Member'}
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
                            placeholder="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="border p-2 rounded"
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="border p-2 rounded"
                            required
                        />
                        <input
                            type="tel"
                            placeholder="Phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="border p-2 rounded col-span-2"
                        />
                    </div>
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded mt-4">
                        {editingId ? 'Update' : 'Create'} Member
                    </button>
                </form>
            )}

            <table className="w-full border-collapse border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2 text-left">ID</th>
                        <th className="border p-2 text-left">Name</th>
                        <th className="border p-2 text-left">Email</th>
                        <th className="border p-2 text-left">Phone</th>
                        <th className="border p-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map((member) => (
                        <tr key={member.id}>
                            <td className="border p-2">{member.id}</td>
                            <td className="border p-2">{member.name}</td>
                            <td className="border p-2">{member.email}</td>
                            <td className="border p-2">{member.phone || '-'}</td>
                            <td className="border p-2">
                                <button
                                    onClick={() => handleEdit(member)}
                                    className="text-blue-600 hover:underline mr-2"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(member.id)}
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
