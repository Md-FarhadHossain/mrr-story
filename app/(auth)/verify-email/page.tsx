import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-page)] text-[var(--text-primary)]">
      <div className="w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-xl border border-[var(--border-color)] overflow-hidden text-center p-8">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
          <MailCheck className="w-8 h-8 text-[var(--primary-blue)]" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Check your email</h1>
        
        <p className="text-[var(--text-secondary)] mb-8">
          We've sent a verification link to your email address. Please click the link to verify your account.
        </p>

        <Link
          href="/sign-in"
          className="inline-block py-3 px-8 bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}
