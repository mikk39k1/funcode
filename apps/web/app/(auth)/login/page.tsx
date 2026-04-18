import Link from "next/link";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <div className="bg-surface-container-low rounded-lg p-8 shadow-ambient">
      <h2 className="text-xl font-bold text-on-surface mb-1">
        Welcome back, adventurer
      </h2>
      <p className="text-on-surface-variant text-sm mb-8">
        Sign in to continue your quests
      </p>

      {params.error && (
        <div className="mb-6 p-3 rounded-[var(--radius)] bg-error-container/30 text-error text-sm">
          {decodeURIComponent(params.error)}
        </div>
      )}

      <form action={login} className="flex flex-col gap-5">
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <Input
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />

        <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
          Sign in
        </Button>
      </form>

      <p className="text-center text-on-surface-variant text-sm mt-6">
        No account yet?{" "}
        <Link
          href="/signup"
          className="text-primary hover:text-primary-dim transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
