// src/app/logout/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Simulate logout
    alert('You have been logged out.');
    router.push('/');
  }, [router]);

  return (
    <Layout>
      <p>Logging out...</p>
    </Layout>
  );
}
