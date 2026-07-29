'use client';

import Image from 'next/image';
import { useActionState } from 'react';
import { login } from './actions';
import { SignInBackground } from '@/components/SignInBackground';

export default function LoginPage() {
  const [error, formAction, isPending] = useActionState(login, null);

  return (
    <SignInBackground>
      <Image
        src="/pine-cleaning-logo.webp"
        alt="Pine Cleaning Co."
        width={1462}
        height={328}
        priority
        className="mx-auto mb-6 h-[60px] w-auto"
      />
      <form action={formAction} className="space-y-4 text-left">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-primary">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-primary">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-primary py-3.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </SignInBackground>
  );
}
