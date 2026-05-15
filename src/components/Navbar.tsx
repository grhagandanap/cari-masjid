import { useState, useEffect, useRef } from "react";
import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { MapPin, Plus, LogOut, User as UserIcon, Menu, X } from "lucide-react";
import { useAuth, signOut } from "#/hooks/use-auth.ts";
import { Button } from "#/components/ui/button.tsx";

export function Navbar() {
	const { user, isPending } = useAuth();
	const router = useRouter();
	const location = useLocation();
	const [menuOpen, setMenuOpen] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		function onClick(e: MouseEvent) {
			if (!menuRef.current) return;
			if (!menuRef.current.contains(e.target as Node)) {
				setMenuOpen(false);
			}
		}
		document.addEventListener("mousedown", onClick);
		return () => document.removeEventListener("mousedown", onClick);
	}, []);

	async function handleSignOut() {
		await signOut();
		setMenuOpen(false);
		await router.invalidate();
		await router.navigate({ to: "/" });
	}

	const initial = (user?.name || user?.email || "?").slice(0, 1).toUpperCase();
	const isAuth = !!user;

	return (
		<header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
				{/* Brand */}
				<Link
					to="/"
					className="flex items-center gap-2 font-semibold tracking-tight no-underline"
				>
					<span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
						<MapPin className="size-4" />
					</span>
					<span className="text-lg">CariMasjid</span>
				</Link>

				{/* Desktop nav */}
				<nav className="hidden items-center gap-1 md:flex">
					<NavItem to="/" active={location.pathname === "/"}>
						Home
					</NavItem>
					{isAuth ? (
						<NavItem to="/mosque/add" active={location.pathname === "/mosque/add"}>
							Add Mosque
						</NavItem>
					) : null}
				</nav>

				{/* Right side */}
				<div className="flex items-center gap-2">
					{isPending ? (
						<div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
					) : isAuth ? (
						<>
							<Button asChild variant="outline" size="sm" className="hidden gap-1.5 sm:inline-flex">
								<Link to="/mosque/add">
									<Plus className="size-4" />
									Add Mosque
								</Link>
							</Button>
							<div className="relative" ref={menuRef}>
								<button
									type="button"
									onClick={() => setMenuOpen((o) => !o)}
									className="flex items-center gap-2 rounded-full border border-border bg-card px-1.5 py-1 pr-3 text-sm font-medium shadow-sm transition hover:shadow-md"
								>
									<span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white">
										{initial}
									</span>
									<span className="hidden max-w-[120px] truncate sm:inline">
										{user.name || user.email}
									</span>
								</button>
								{menuOpen ? (
									<div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
										<div className="border-b border-border px-3 py-2.5">
											<p className="truncate text-sm font-medium">
												{user.name || "Account"}
											</p>
											<p className="truncate text-xs text-muted-foreground">
												{user.email}
											</p>
										</div>
										<div className="p-1">
											<button
												type="button"
												className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-accent"
												onClick={() => setMenuOpen(false)}
											>
												<UserIcon className="size-4" />
												Profile
											</button>
											<button
												type="button"
												className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-destructive hover:bg-destructive/10"
												onClick={handleSignOut}
											>
												<LogOut className="size-4" />
												Sign out
											</button>
										</div>
									</div>
								) : null}
							</div>
						</>
					) : (
						<div className="hidden items-center gap-2 sm:flex">
							<Button asChild variant="ghost" size="sm">
								<Link to="/auth/login" search={{ redirect: undefined }}>
									Login
								</Link>
							</Button>
							<Button asChild size="sm">
								<Link to="/auth/register">Register</Link>
							</Button>
						</div>
					)}

					{/* Mobile toggle */}
					<button
						type="button"
						className="inline-flex size-9 items-center justify-center rounded-md border border-border md:hidden"
						onClick={() => setMobileOpen((o) => !o)}
						aria-label="Toggle menu"
					>
						{mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
					</button>
				</div>
			</div>

			{/* Mobile menu */}
			{mobileOpen ? (
				<div className="border-t border-border bg-background/95 md:hidden">
					<div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
						<Link
							to="/"
							className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
							onClick={() => setMobileOpen(false)}
						>
							Home
						</Link>
						{isAuth ? (
							<Link
								to="/mosque/add"
								className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
								onClick={() => setMobileOpen(false)}
							>
								Add Mosque
							</Link>
						) : (
							<div className="mt-2 flex flex-col gap-2">
								<Button asChild variant="outline">
									<Link to="/auth/login" search={{ redirect: undefined }}>
										Login
									</Link>
								</Button>
								<Button asChild>
									<Link to="/auth/register">Register</Link>
								</Button>
							</div>
						)}
					</div>
				</div>
			) : null}
		</header>
	);
}

function NavItem({
	to,
	active,
	children,
}: {
	to: string;
	active?: boolean;
	children: React.ReactNode;
}) {
	return (
		<Link
			to={to}
			className={`rounded-md px-3 py-1.5 text-sm font-medium no-underline transition ${
				active
					? "bg-accent text-accent-foreground"
					: "text-muted-foreground hover:bg-accent hover:text-foreground"
			}`}
		>
			{children}
		</Link>
	);
}
