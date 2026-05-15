import { authClient } from "#/lib/auth-client.ts";

export function useAuth() {
	const { data: session, isPending, error } = authClient.useSession();
	return {
		session,
		user: session?.user ?? null,
		isPending,
		error,
		isAuthenticated: !!session?.user,
	};
}

export async function signOut() {
	return authClient.signOut();
}
