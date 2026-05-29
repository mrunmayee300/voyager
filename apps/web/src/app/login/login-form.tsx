'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  password: z.string().min(1),
});

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      setError('');
      const res = await api<{ token: string; user: { id: string; email: string; firstName: string; lastName: string } }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify(data) },
      );
      setAuth(res.token, res.user);
      router.push(params.get('redirect') || '/dashboard');
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="editorial-heading text-3xl font-semibold text-sand-900">Sign in</h1>
      <p className="mt-2 text-sm text-sand-800/60">
        New here? <Link href="/register" className="text-ocean-700 hover:underline">Create an account</Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="card-elevated mt-8 space-y-4 p-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" className="mt-2" {...register('email')} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" className="mt-2" {...register('password')} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
