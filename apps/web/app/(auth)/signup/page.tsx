import Link from "next/link";
import { signup } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface SignupPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;

  return (
    <div className="bg-surface-container-low rounded-lg p-8 shadow-ambient">
      <h2 className="text-xl font-bold text-on-surface mb-1">
        Begin your journey
      </h2>
      <p className="text-on-surface-variant text-sm mb-8">
        Create your account and start your first quest
      </p>

      {params.error && (
        <div className="mb-6 p-3 rounded-[var(--radius)] bg-error-container/30 text-error text-sm">
          {decodeURIComponent(params.error)}
        </div>
      )}

      <form action={signup} className="flex flex-col gap-5">
        <Input
          name="username"
          type="text"
          label="Username"
          placeholder="the_cozy_coder"
          required
          autoComplete="username"
          hint="This will be your public adventurer name"
        />
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
          autoComplete="new-password"
          hint="At least 8 characters"
        />

        <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
          Create account
        </Button>
      </form>

      <p className="text-center text-on-surface-variant text-sm mt-6">
        Already an adventurer?{" "}
        <Link
          href="/login"
          className="text-primary hover:text-primary-dim transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
