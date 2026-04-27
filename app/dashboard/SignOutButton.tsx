"use client";

import { useState } from "react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

export default function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/admin");
            router.refresh();
          },
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-medium disabled:opacity-50"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
      Sign Out
    </button>
  );
}
