export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-1">
            FunCode
          </h1>
          <p className="text-on-surface-variant text-sm">
            The Hearthside Terminal — craft code, not algorithms
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
