'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Root() {
  const router = useRouter();
  useEffect(() => {
    router.replace(localStorage.getItem('saToken') ? '/dashboard' : '/login');
  }, []);
  return null;
}
