import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL, // Defaults to relative origin if undefined
});

export const {
    useSession,
    signIn,
    signUp,
    signOut,
} = authClient;
