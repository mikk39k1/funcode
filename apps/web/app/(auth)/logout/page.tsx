import { logout } from "@/lib/actions/auth";

export default function LogoutPage() {
  return (
    <form action={logout} className="contents">
      <button type="submit" className="hidden" />
    </form>
  );
}
