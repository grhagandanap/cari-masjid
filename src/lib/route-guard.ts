import { redirect } from "@tanstack/react-router";
import { getServerSession } from "#/lib/server/auth.ts";

export async function requireAuth({
	to = "/auth/login",
	search,
}: {
	to?: string;
	search?: Record<string, unknown>;
} = {}) {
	const session = await getServerSession();
	if (!session) {
		throw redirect({
			to,
			search,
		});
	}
	return session;
}
