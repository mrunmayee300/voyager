'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      setError('');
      const res = await api<{ token: string; user: { id: string; email: string; firstName: string; lastName: string } }>(
        '/auth/register',
        { method: 'POST', body: JSON.stringify(data) },
      );
      setAuth(res.token, res.user);
      router.push('/dashboard');
    } catch {
      setError('Could not create account. Email may already be in use.');
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="editorial-heading text-3xl font-semibold text-sand-900">Create account</h1>
      <p className="mt-2 text-sm text-sand-800/60">
        Already have one? <Link href="/login" className="text-ocean-700 hover:underline">Sign in</Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="card-elevated mt-8 space-y-4 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" className="mt-2" {...register('firstName')} />
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" className="mt-2" {...register('lastName')} />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" className="mt-2" {...register('email')} />
        </div>
        <div>
          <Label htmlFor="password">Password (8+ characters)</Label>
          <Input id="password" type="password" className="mt-2" {...register('password')} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Get started'}
        </Button>
      </form>
    </div>
  );
}
