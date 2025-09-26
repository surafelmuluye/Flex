'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, Loader2 } from 'lucide-react';
import { signIn, signUp } from './manager-actions';
import useSWR from 'swr';

interface ActionState {
  error?: string;
  success?: string;
  name?: string | FormDataEntryValue | null;
  email?: string | FormDataEntryValue | null;
  password?: string | FormDataEntryValue | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ManagerLogin({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const { data: setupData } = useSWR('/api/auth/setup', fetcher);
  const [currentMode, setCurrentMode] = useState(mode);
  
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    currentMode === 'signin' ? signIn : signUp,
    { error: '' }
  );

  // If it's first time setup, force signup mode
  useEffect(() => {
    if (setupData?.data?.isFirstTimeSetup && currentMode === 'signin') {
      setCurrentMode('signup');
    }
  }, [setupData, currentMode]);

  const isFirstTimeSetup = setupData?.data?.isFirstTimeSetup;
  const showSignupOption = isFirstTimeSetup || currentMode === 'signup';

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Star className="h-12 w-12 text-orange-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isFirstTimeSetup
            ? 'Set up your manager account'
            : currentMode === 'signin'
            ? 'Sign in to Reviews Dashboard'
            : 'Create manager account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isFirstTimeSetup
            ? 'Welcome to Flex Reviews Dashboard. Create your first manager account to get started.'
            : currentMode === 'signin'
            ? 'Access the property reviews management system'
            : 'Create a new manager account'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" action={formAction}>
          {(currentMode === 'signup' || isFirstTimeSetup) && (
            <div>
              <Label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </Label>
              <div className="mt-1">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  defaultValue={state.name?.toString() || ''}
                  required
                  maxLength={100}
                  className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
          )}

          <div>
            <Label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </Label>
            <div className="mt-1">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state.email?.toString() || ''}
                required
                maxLength={255}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </Label>
            <div className="mt-1">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  currentMode === 'signin' ? 'current-password' : 'new-password'
                }
                defaultValue={state.password?.toString() || ''}
                required
                minLength={8}
                maxLength={100}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder={currentMode === 'signin' ? 'Enter your password' : 'Create a secure password (min 8 characters)'}
              />
            </div>
          </div>

          {state?.error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-red-800 text-sm">{state.error}</div>
            </div>
          )}

          {state?.success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-green-800 text-sm">{state.success}</div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  {currentMode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : isFirstTimeSetup ? (
                'Set up account'
              ) : currentMode === 'signin' ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </Button>
          </div>
        </form>

        {/* Only show toggle option if not first time setup */}
        {!isFirstTimeSetup && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  {currentMode === 'signin'
                    ? 'Need to create an account?'
                    : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setCurrentMode(currentMode === 'signin' ? 'signup' : 'signin')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                {currentMode === 'signin'
                  ? 'Create a manager account'
                  : 'Sign in to existing account'}
              </button>
            </div>
          </div>
        )}

        {isFirstTimeSetup && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>First-time setup:</strong> This account will have full administrative access to manage property reviews.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
