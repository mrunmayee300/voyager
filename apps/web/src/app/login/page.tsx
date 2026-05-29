import { Suspense } from 'react';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-5 py-16 text-center text-sm text-sand-800/50">Loading...</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
