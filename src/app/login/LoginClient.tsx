"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || undefined;
  const showAccessDenied = error === "AccessDenied";
  const showGenericError = !!error && !showAccessDenied;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800">Sign in</h1>
        <p className="mt-1 text-sm text-gray-600">Use your company Google account.</p>

        {showAccessDenied && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Access denied: your email domain is not allowed.
          </div>
        )}
        {showGenericError && (
          <div className="mt-4 rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
            Sign-in error: {error}
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Continue with Google
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Only emails from the allowed domain can sign in.
        </p>
      </div>
    </main>
  );
}

