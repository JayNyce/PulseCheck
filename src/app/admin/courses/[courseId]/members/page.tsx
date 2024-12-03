// src/app/admin/courses/[courseId]/members/page.tsx

'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';

interface User {
  id: number;
  name: string;
  email: string;
}

export default function ManageCourseMembersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId;

  const [courseName, setCourseName] = useState('');
  const [members, setMembers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [message, setMessage] = useState('');

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/auth/login');
    else if (!session.user.isAdmin) router.push('/dashboard');
  }, [session, status, router]);

  // Fetch course name and members
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Fetch course name
        const res = await fetch(`/api/courses/${courseId}`);
        if (!res.ok) throw new Error('Failed to fetch course data.');
        const data = await res.json();
        setCourseName(data.name);

        // Fetch course members
        const membersRes = await fetch(`/api/courses/${courseId}/members`);
        if (!membersRes.ok) throw new Error('Failed to fetch members.');
        const membersData = await membersRes.json();
        setMembers(membersData);
      } catch (error: any) {
        console.error('Error fetching course data:', error);
        setMessage(error.message || 'An error occurred while fetching course data.');
      }
    };
    if (courseId) fetchCourseData();
  }, [courseId]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await fetch(`/api/users/all?search=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Failed to search users.');
        const data: User[] = await res.json();
        // Exclude users already in members of the current course
        const filtered = data.filter((user) => !members.some((member) => member.id === user.id));
        setSearchResults(filtered);
      } catch (error: any) {
        console.error('Error searching users:', error);
        setMessage(error.message || 'An error occurred while searching users.');
      }
    }, 500),
    [members]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Add user to course
  const handleAddMember = async (userId: number) => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        try {
          const newMember: User = await res.json();
          setMembers((prev) => [...prev, newMember]);
          setSearchQuery('');
          setSearchResults([]);
          setMessage('Member added successfully.');
        } catch (e) {
          console.error('Failed to parse JSON:', e);
          setMessage('Member added, but failed to parse response.');
        }
      } else {
        let errorData;
        try {
          errorData = await res.json();
        } catch (e) {
          errorData = { error: 'Failed to add member.' };
        }
        setMessage(errorData.error || 'Failed to add member.');
      }
    } catch (error: any) {
      console.error('Error adding member:', error);
      setMessage('An error occurred.');
    }
  };

  // Remove user from course
  const handleRemoveMember = async (userId: number) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/members/${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMembers((prev) => prev.filter((member) => member.id !== userId));
        setMessage('Member removed successfully.');
      } else {
        let errorData;
        try {
          errorData = await res.json();
        } catch (e) {
          errorData = { error: 'Failed to remove member.' };
        }
        setMessage(errorData.error || 'Failed to remove member.');
      }
    } catch (error: any) {
      console.error('Error removing member:', error);
      setMessage('An error occurred.');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">
        Manage Members for Course "{courseName}"
      </h1>

      {message && (
        <p
          className={`mb-4 ${
            message.includes('successfully') ? 'text-green-600' : 'text-red-600'
          } font-semibold`}
        >
          {message}
        </p>
      )}

      {/* Search and Add Member */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search users by name or email"
          className="border border-gray-300 p-2 rounded w-full max-w-md"
          aria-label="Search users to add"
        />
        {searchResults.length > 0 && (
          <ul className="mt-2 bg-white border border-gray-300 rounded max-w-md">
            {searchResults.map((user) => (
              <li
                key={user.id}
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => handleAddMember(user.id)}
              >
                {user.name} ({user.email})
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Members List */}
      <table className="w-full border-collapse bg-white shadow-md rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="border-b p-2 text-left">ID</th>
            <th className="border-b p-2 text-left">Name</th>
            <th className="border-b p-2 text-left">Email</th>
            <th className="border-b p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="hover:bg-gray-50">
              <td className="border-b p-2">{member.id}</td>
              <td className="border-b p-2">{member.name}</td>
              <td className="border-b p-2">{member.email}</td>
              <td className="border-b p-2 text-center">
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
          {members.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center">
                No members in this course.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
