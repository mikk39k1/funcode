import { confirmDeviceCode } from "@/lib/actions/device-auth";
import { Button } from "@/components/ui/Button";

interface DevicePageProps {
  searchParams: Promise<{ code?: string; error?: string; success?: string }>;
}

export default async function DevicePage({ searchParams }: DevicePageProps) {
  const params = await searchParams;

  return (
    <div className="bg-surface-container-low rounded-lg p-8 shadow-ambient text-center">
      {params.success ? (
        <>
          <div className="text-4xl mb-4">✨</div>
          <h2 className="text-xl font-bold text-secondary mb-2">
            Login confirmed!
          </h2>
          <p className="text-on-surface-variant text-sm">
            Your CLI is now authenticated. You can close this tab and return to
            your terminal.
          </p>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-on-surface mb-2">
            Confirm CLI Login
          </h2>
          <p className="text-on-surface-variant text-sm mb-6">
            Your terminal is requesting access to your FunCode account. Confirm
            the code matches what you see in the terminal.
          </p>

          {params.error === "invalid" && (
            <div className="mb-6 p-3 rounded-[var(--radius)] bg-error-container/30 text-error text-sm">
              That code is invalid or has expired. Please run{" "}
              <code className="font-mono">funcode login</code> again.
            </div>
          )}

          {params.code && (
            <div className="bg-surface-container-highest rounded-md px-6 py-4 mb-8 inline-block">
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Your code
              </p>
              <p className="text-2xl font-bold text-primary font-mono tracking-widest">
                {params.code}
              </p>
            </div>
          )}

          <form action={confirmDeviceCode}>
            <input type="hidden" name="userCode" value={params.code ?? ""} />
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Yes, confirm this login
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
