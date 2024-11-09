// src/app/auth/signup/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Course {
  id: number;
  name: string;
  passKey: string | null;
}

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | 'No Enrollment'>('No Enrollment');
  const [passKey, setPassKey] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error('Failed to fetch courses.');
        const data: Course[] = await res.json();
        setCourses(data);
      } catch (error) {
        console.error(error);
        setMessage('Failed to load courses.');
      }
    };
    fetchCourses();
  }, []);

  // Determine if selected course requires passKey
  const selectedCourse = courses.find((course) => course.id === selectedCourseId);
  const requiresPassKey = selectedCourse?.passKey ? true : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare payload
    const payload: any = { name, email, password };
    if (selectedCourseId !== 'No Enrollment') {
      payload.courseId = selectedCourseId;
      if (requiresPassKey) {
        payload.passKey = passKey.trim();
      }
    }

    // Basic validation
    if (requiresPassKey && !passKey.trim()) {
      setMessage('PassKey is required for the selected course.');
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage('Signup successful. Redirecting to login...');
        setTimeout(() => router.push('/auth/login'), 3000);
      } else {
        const errorData = await res.json();
        setMessage(`Signup failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 shadow-md rounded-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>
        
        {message && (
          <p
            className={`text-center font-semibold ${
              message.includes('successful') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}
        
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full p-2 border rounded"
          required
        />
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded"
          required
        />
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded"
          required
        />
        
        {/* Optional Course Enrollment */}
        <div>
          <label className="block mb-2 font-medium">Enroll in a Course (Optional)</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value === 'No Enrollment' ? 'No Enrollment' : parseInt(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value="No Enrollment">No Enrollment</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} {course.passKey ? '(Requires PassKey)' : ''}
              </option>
            ))}
          </select>
        </div>
        
        {requiresPassKey && (
          <input
            type="text"
            value={passKey}
            onChange={(e) => setPassKey(e.target.value)}
            placeholder="Enter PassKey"
            className="w-full p-2 border rounded"
            maxLength={6}
          />
        )}
        
        <button type="submit" className="w-full bg-black text-white p-2 rounded">
          Sign Up
        </button>
      </form>
    </div>
  );
}
